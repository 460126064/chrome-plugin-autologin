(() => {
    const InjectUtils =  {
        triggerEvent (type: string, element: HTMLElement | HTMLInputElement, value?: string) {
            if (value) {
                (element as HTMLInputElement).value = value
            }
            const e = new CustomEvent(type, {detail: { value }})
            element.dispatchEvent(e)
        }
    }
    // 监听事件, CSP策略可能导致click在Content中不能调用, 所以我们放到inject中使用
    window.addEventListener('message', (data: any) => {
        const {type, BTN_EL} = data.data
        if (type === 'submit') {
            const btn = document.querySelector(BTN_EL)
            // 表单类型的优先调用表单提交
            if (/form/i.test(btn.nodeName)) {
                btn.submit()
                return
            }
            InjectUtils.triggerEvent('click', btn)
            btn.click()
        }
    })
})()