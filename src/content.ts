(() => {
    const Utils =  {
        getElement (el: HTMLElement | HTMLInputElement) {
            let resultEl = el
            while (resultEl) {
                const code = this.getUnique(resultEl)
                if (code) break
                resultEl = el.parentElement as HTMLElement
            }
            return resultEl
        },
        getUnique (el: HTMLElement | HTMLInputElement) {
            let className = '', id = '', attrs = ''
            if (el.id) {
                id = `#${el.id}`
            }
            if (el.className) {
                className = `.${el.className.trim().replace(/\s+/g, '.')}`
            }
            const attributeNames = el.getAttributeNames()
            attrs = attributeNames.map(attrName => {
                if (attrName === 'id' || attrName === 'class' || attrName === 'style') return ''
                const attrValue = el.getAttribute(attrName) || ''
                return `[${attrName}${attrValue ? '="' + attrValue + '"' : ''}]`
            }).join('')
            if (!id && !className && !attrs) return ''
            return `${el.nodeName.toLowerCase()}${id}${className}${attrs}`
        },
        getStorage (keys: string[]) {
            return new Promise((resolve) => {
                chrome.storage.sync.get(keys, (values: any) => {
                    resolve(values)
                })
            })
        },
        setStorage (values: any) {
            return new Promise((resolve) => {
                chrome.storage.sync.set(values, () => {
                    resolve(void 0)
                })
            })
        },
        triggerEvent (type: string, element: HTMLElement | HTMLInputElement, value?: string) {
            if (value) {
                (element as HTMLInputElement).value = value
            }
            const e = new CustomEvent(type, {detail: { value }})
            element.dispatchEvent(e)
        },
        injectScript (jsPath: string = '/static/js/inject.js') {
            var temp = document.createElement('script')
            temp.setAttribute('type', 'text/javascript')
            temp.src = chrome.runtime.getURL(jsPath)
            temp.onload = function() {
                document.body.removeChild(temp)
            }
            document.body.appendChild(temp)        
        }
    }
    let clickedEl: HTMLElement | HTMLInputElement
    // 注入inject脚本
    Utils.injectScript()
    // 监听右键事件
    document.addEventListener('contextmenu', function(event){
        clickedEl = (event.target as HTMLElement)
    }, true)
    // 监听background事件
    chrome.runtime.onMessage.addListener(async (request: any) => {
        const {menuItemId, type, account, pwd, btn} = request
        // 缓存当前页面地址
        let { pageUrls = {} } = await (Utils.getStorage(['pageUrls']) as Promise<{pageUrls: BaeObjectType}>)
        let currentLocationInfo = pageUrls[location.href]
        // 去重, Set类型不支持
        if (!pageUrls[location.href]) {
            pageUrls[location.href] = (currentLocationInfo = {})
        }
        // 判断是否为手动修正模式
        if (type === 'manual') {
            Object.assign(currentLocationInfo, {
                ACCOUNT_EL: account || currentLocationInfo.ACCOUNT_EL,
                PWD_EL: pwd || currentLocationInfo.PWD_EL,
                BTN_EL: btn || currentLocationInfo.BTN_EL
            })
            await Utils.setStorage({
                pageUrls
            })
            return
        }
        // 判断类型
        if (menuItemId === 'ACCOUNT' || menuItemId === 'PWD') {
            Object.assign(currentLocationInfo, ({
                [menuItemId]: (clickedEl as HTMLInputElement).value,
                [`${menuItemId}_EL`]: Utils.getUnique(clickedEl)
            } as BaeObjectType))
            console.log(`${menuItemId} is set to ${(clickedEl as HTMLInputElement).value}`)
            console.log(`${menuItemId}_EL is set to ${Utils.getUnique(clickedEl)}`)
            await Utils.setStorage({
                pageUrls
            })
            return
        }
        // 按钮需要招自己查找一下是否存储正确
        Object.assign(currentLocationInfo, {
            [`${menuItemId}_EL`]: Utils.getUnique(Utils.getElement(clickedEl))
        })
        console.log(`${menuItemId}_EL is set to ${Utils.getUnique(Utils.getElement(clickedEl))}`)
        await Utils.setStorage({
            pageUrls
        })
    })
    // 自动登录
    window.addEventListener('load', async () => {
        // 延迟, 防止页面脚本执行未完成
        let { pageUrls = {} } = await (Utils.getStorage(['pageUrls']) as Promise<{pageUrls: BaeObjectType}>)
        console.log(pageUrls, 'pageUrls')
        // 未存储过, 直接返回
        if (!pageUrls[location.href]) {
            return
        }
        setTimeout(async () => {
            const values = pageUrls[location.href]
            const {
                ACCOUNT,
                PWD,
                ACCOUNT_EL,
                PWD_EL,
                BTN_EL,
            } = values as any
            if ((ACCOUNT || PWD) && BTN_EL) {
                const events = ['input', 'change', 'focus']
                events.forEach(event => {
                    const account = document.querySelector(ACCOUNT_EL)
                    const pwd = document.querySelector(PWD_EL)
                    Utils.triggerEvent(event, account, ACCOUNT)
                    Utils.triggerEvent(event, pwd, PWD)
                })
                // 发送通知到inject脚本
                window.postMessage({
                    BTN_EL,
                    type: 'submit'
                }, location.origin)
            }
        }, 200)
    })
})()