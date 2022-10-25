interface SubMenuType {
	title: string;
	id: string;
	type: 'normal' | 'radio' | 'checkbox';
}
interface TabType {
	active: boolean;
	id: number;
	index: number;
}
chrome.runtime.onInstalled.addListener(() =>{
	const submenus: SubMenuType[] = [{
		title: '账号',
		id: 'ACCOUNT',
		type: 'normal'
	}, {
		title: '密码',
		id: 'PWD',
		type: 'normal'
	}, {
		title: '登陆按钮',
		id: 'BTN',
		type: 'normal'
	}]
	submenus.forEach(submenu => {
		chrome.contextMenus.create({
			contexts: ['all'],
			title: submenu.title,
			id: submenu.id,
			type: submenu.type
		});
	})
})
// bind event
chrome.contextMenus.onClicked.addListener((info: SubMenuType, tab: TabType) => {
	// 短连接
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs: any) {
		chrome.tabs.sendMessage(tabs[0].id, info, (response: any) => {
		  console.log(response.farewell)
		})
	})
})