import fs from "fs";
import { join } from "path";
import { app, Menu, BrowserWindow, globalShortcut, dialog } from "electron";
import isDev from "electron-is-dev";
import ffsConfig from "./ffs-config.json";

interface FFSConfig {
  PLACES_SQLITE_SRC: string | undefined;
  PLACES_SQLITE_DEST: string | undefined;
}

const handleError = (title: string, e: unknown) => {
  if (e instanceof Error) {
    dialog.showErrorBox(title, e.message);
  } else {
    dialog.showErrorBox("Unexpected error", e as any);
  }
};

const copySqlite = () => {
  try {
    const { PLACES_SQLITE_SRC: src, PLACES_SQLITE_DEST: dest } =
      ffsConfig as FFSConfig;

    if (!src || !dest) {
      throw new Error("src or dest does not exist!");
    }

    if (fs.existsSync(dest)) {
      const options: Electron.MessageBoxOptions = {
        type: "info",
        title: "起動の準備",
        message: `${dest} が既に存在します。`,
      };
      dialog.showMessageBoxSync(options);
    } else {
      fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
    }
  } catch (e) {
    handleError("Failed to copy sqlite file", e);
  }
};

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({ width: 1000, height: 800 });

  // load index.html
  const url = isDev
    ? "http://localhost:5173"
    : join(__dirname, "../out/index.html");

  if (isDev) {
    mainWindow.loadURL(url);
  } else {
    mainWindow.loadFile(url);
  }

  // 開発ツールを有効化する
  mainWindow.webContents.openDevTools();

  Menu.setApplicationMenu(null);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  // ショートカットキー: Ctrl + F5 アプリ(mainWindow)のリロード
  globalShortcut.register("CommandOrControl+F5", () => {
    if (mainWindow && mainWindow.isFocused()) {
      console.log("Reload main window");
      mainWindow.reload();
    }
  });
  // 開発者ツールをtoggleする: Ctrl + F9
  globalShortcut.register("CommandOrControl+F9", () => {
    if (!mainWindow) return;
    const wc = mainWindow.webContents;
    const isDevToolsOpen = wc.isDevToolsOpened();
    const isFocus = mainWindow.isFocused();
    const isDevToolsFocus = wc.isDevToolsFocused();
    if (isDevToolsOpen && (isFocus || isDevToolsFocus)) wc.closeDevTools();
    else if (!isDevToolsOpen && isFocus) wc.openDevTools();
  });
  // sqliteファイルをコピーする
  copySqlite();
});

app.on("ready", createWindow);

app.on("will-quit", () => {
  // すべてのショートカットキーを登録解除する
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
