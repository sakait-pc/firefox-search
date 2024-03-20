import fs from "fs";
import { join, basename } from "path";
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
import {
  LOCAL_BASE_URL,
  PLACES_SQLITE,
  DETAIL_PRE,
  DETAIL_POST,
} from "./constants";
import { DatabaseModule } from "./db";

const handleError = (title: string, e: unknown) => {
  if (e instanceof Error) {
    dialog.showErrorBox(title, e.message);
  } else {
    dialog.showErrorBox("Unexpected error", e as any);
  }
};

const isMac = process.platform === 'darwin';
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
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(url);
  }

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
  globalShortcut.register("CommandOrControl+F5", () => {
    if (mainWindow && mainWindow.isFocused()) {
      console.log("Reload main window");
      mainWindow.reload();
    }
  });
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

const makeUserSelectPathToPlacesSqlite = () => {
  const pathOnWindows = join(
    app.getPath("appData"),
    "Mozilla",
    "Firefox",
    "Profiles"
  );
  const pathOnMac = join(
    app.getPath("appData"),
    "Firefox",
    "Profiles"
  );
  const profilesPath = isMac ? pathOnMac : pathOnWindows;
  const detailPlacesPath = `${profilesPath} > [PROFILE_NAME] > ${PLACES_SQLITE}`;
  dialog.showMessageBoxSync({
    title: "Welcome to Firefox Search",
    message: `Please select the path to ${PLACES_SQLITE}`,
    detail: `${DETAIL_PRE}${detailPlacesPath}${DETAIL_POST}`,
  });
  const src = dialog.showOpenDialogSync({
    title: `Select ${detailPlacesPath}`,
    properties: ["openFile"],
    defaultPath: profilesPath,
    filters: [{ name: "Sqlite File", extensions: ["sqlite"] }],
  })?.[0];
  return src;
};

const initDB = () => {
  const dest = join(app.getPath("userData"), PLACES_SQLITE);
  if (!fs.existsSync(dest)) {
    const store = new ElectronStore<StoreType>();
    if (!store.has("src")) {
      const src = makeUserSelectPathToPlacesSqlite();
      if (!src || basename(src) !== PLACES_SQLITE) {
        throw new Error(`Invalid src. src is ${src}`);
      }
      store.set("src", src);
    }

    const src = store.get("src");
    // Validate src because user can edit it directly in config.json.
    if (!src || basename(src) !== PLACES_SQLITE) {
      throw new Error(`Invalid src. src is ${src}`);
    }
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
    if (isDev) {
      registerGlobalShortcut();
    }
    initDB();
  })
  .catch(e => {
    handleError("Failed to start app.", e);
    app.quit();
  });

app.on("ready", createWindow);

app.on("will-quit", () => {
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
