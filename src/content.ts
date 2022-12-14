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
    // ??????inject??????
    Utils.injectScript()
    // ??????????????????
    document.addEventListener('contextmenu', function(event){
        clickedEl = (event.target as HTMLElement)
    }, true)
    // ??????background??????
    chrome.runtime.onMessage.addListener(async (request: any) => {
        const {menuItemId, type, account, pwd, btn} = request
        // ????????????????????????
        let { pageUrls = {} } = await (Utils.getStorage(['pageUrls']) as Promise<{pageUrls: BaeObjectType}>)
        let currentLocationInfo = pageUrls[location.href]
        // ??????, Set???????????????
        if (!pageUrls[location.href]) {
            pageUrls[location.href] = (currentLocationInfo = {})
        }
        // ?????????????????????????????????
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
        // ????????????
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
        // ???????????????????????????????????????????????????
        Object.assign(currentLocationInfo, {
            [`${menuItemId}_EL`]: Utils.getUnique(Utils.getElement(clickedEl))
        })
        console.log(`${menuItemId}_EL is set to ${Utils.getUnique(Utils.getElement(clickedEl))}`)
        await Utils.setStorage({
            pageUrls
        })
    })
    // ????????????
    window.addEventListener('load', async () => {
        // ??????, ?????????????????????????????????
        let { pageUrls = {} } = await (Utils.getStorage(['pageUrls']) as Promise<{pageUrls: BaeObjectType}>)
        console.log(pageUrls, 'pageUrls')
        // ????????????, ????????????
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
                // ???????????????inject??????
                window.postMessage({
                    BTN_EL,
                    type: 'submit'
                }, location.origin)
            }
        }, 200)
    })
})()