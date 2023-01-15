import fs from "fs";
import { join } from "path";
import {
  app,
  Menu,
  BrowserWindow,
  globalShortcut,
  dialog,
  shell,
  ipcMain,
} from "electron";
import isDev from "electron-is-dev";
import ElectronStore from "electron-store";
import type { MatchType, TargetType, StoreType } from "./entities";
import { LOCAL_BASE_URL } from "./constants";
import { DatabaseModule } from "./db";

const handleError = (title: string, e: unknown) => {
  if (e instanceof Error) {
    dialog.showErrorBox(title, e.message);
  } else {
    dialog.showErrorBox("Unexpected error", e as any);
  }
};

let mainWindow: BrowserWindow | null = null;
let db: DatabaseModule | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  // load index.html
  const url = isDev ? LOCAL_BASE_URL : join(__dirname, "../out/index.html");

  if (isDev) {
    mainWindow.loadURL(url);
  } else {
    mainWindow.loadFile(url);
  }

  // 開発ツールを有効化する
  mainWindow.webContents.openDevTools();

  // open external link with default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  Menu.setApplicationMenu(null);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

const registerGlobalShortcut = () => {
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
};

const initDB = () => {
  const store = new ElectronStore<StoreType>();
  const dest = join(app.getPath("userData"), "places.sqlite");
  if (!fs.existsSync(dest)) {
    if (!store.has("src")) {
      // TODO: user specify src path with File Explorer
      // TODO: save src path to config.json
      // try {
      //   store.set("src", "user specify places.sqlite path")
      // } catch (e) {
      // }
    }

    const src = store.get("src");
    if (!src) throw new Error(`Invalid src. src is ${src}`);
    fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
  }
  db = new DatabaseModule(dest);
  if (!db.existsDB()) {
    throw new Error(
      `Failed to create db instance. App will quit.\nLog: ${db.log}`
    );
  }
};

app
  .whenReady()
  .then(() => {
    registerGlobalShortcut();
    initDB();
  })
  .catch(e => {
    handleError("Failed to start app.", e);
    app.quit();
  });

app.on("ready", createWindow);

app.on("will-quit", () => {
  // すべてのショートカットキーを登録解除する
  globalShortcut.unregisterAll();
  db?.close();
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

ipcMain.handle(
  "SELECT",
  async (_, title: string, match: MatchType, target: TargetType) => {
    try {
      const rows = await db?.selectAsync(title, match, target);
      return rows;
    } catch (e) {
      handleError("Failed to select", e);
    }
  }
);

ipcMain.handle("SELECT_PARENT", async (_, parentId: number) => {
  try {
    const row = await db?.selectParentAsync(parentId);
    return row;
  } catch (e) {
    handleError("Failed to select parent", e);
  }
});
