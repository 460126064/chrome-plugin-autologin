chrome.runtime.onInstalled.addListener(()=>{[{title:"\u8D26\u53F7",id:"ACCOUNT",type:"normal"},{title:"\u5BC6\u7801",id:"PWD",type:"normal"},{title:"\u767B\u9646\u6309\u94AE",id:"BTN",type:"normal"}].forEach(e=>{chrome.contextMenus.create({contexts:["all"],title:e.title,id:e.id,type:e.type})})});chrome.contextMenus.onClicked.addListener((t,e)=>{chrome.tabs.query({active:!0,currentWindow:!0},function(n){chrome.tabs.sendMessage(n[0].id,t,o=>{console.log(o.farewell)})})});
