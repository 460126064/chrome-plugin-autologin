(() => {
    const submit = document.querySelector('#submit') as Element
    const btnEl = document.querySelector('#btn') as HTMLInputElement
    const accountEl = document.querySelector('#account') as HTMLInputElement
    const pwdEl = document.querySelector('#pwd') as HTMLInputElement
    submit.addEventListener('click', () => {
        const account = accountEl.value
        const pwd = pwdEl.value
        const btn = btnEl.value
        chrome.tabs.query({active: true, currentWindow: true}, (tabs: any[]) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'manual',
                account,
                pwd,
                btn
            }, () => {
                alert('修改成功')
            })
        })
    })
})()