interface Chrome {
    contextMenus: {
        create (options: any) :any,
        onClicked: {
            addListener: (callback: Function) => void
        }
    },
    runtime: {
        onInstalled: {
            addListener: (callback: Function) => void
        },
        sendMessage: (option: any, callback: Function) => void,
        onMessage: {
            addListener: (callback: Function) => void
        },
        onConnect: {
            addListener: (callback: Function) => void
        },
        getURL (path: string): string
    },
    tabs: {
        query: (options: any, callback: Function) => void,
        sendMessage: (id: string, option: any, callback: Function) => void,
        connect: (id:string, {
            name: string
        }) => {
            postMessage: (info: any) => void
        }
    },
    storage: {
        sync: {
            get: (option: any, callback: Function) => void,
            set: (option: any, callback?: Function) => void
        }
    },
    extension: {
        getURL (path: string): string
    }
}
interface BaeObjectType {
    [key: string]: any
}
declare var chrome: Chrome