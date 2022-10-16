"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
let mainWindow = null;
const createWindow = () => {
    mainWindow = new electron_1.BrowserWindow({ width: 1000, height: 800 });
    // Load index.html of React
    mainWindow.loadURL("http://localhost:5173");
    // 開発ツールを有効化する
    mainWindow.webContents.openDevTools();
    electron_1.Menu.setApplicationMenu(null);
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
};
electron_1.app.whenReady().then(() => {
    // ショートカットキー: Ctrl + F5 アプリ(mainWindow)のリロード
    electron_1.globalShortcut.register("CommandOrControl+F5", () => {
        if (mainWindow && mainWindow.isFocused()) {
            console.log("Reload main window");
            mainWindow.reload();
        }
    });
    // 開発者ツールをtoggleする: Ctrl + F9
    electron_1.globalShortcut.register("CommandOrControl+F9", () => {
        if (!mainWindow)
            return;
        const wc = mainWindow.webContents;
        const isDevToolsOpen = wc.isDevToolsOpened();
        const isFocus = mainWindow.isFocused();
        const isDevToolsFocus = wc.isDevToolsFocused();
        if (isDevToolsOpen && (isFocus || isDevToolsFocus))
            wc.closeDevTools();
        else if (!isDevToolsOpen && isFocus)
            wc.openDevTools();
    });
});
electron_1.app.on("ready", createWindow);
electron_1.app.on("will-quit", () => {
    // すべてのショートカットキーを登録解除する
    electron_1.globalShortcut.unregisterAll();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});
