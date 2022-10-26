import { ipcRenderer, contextBridge } from "electron";
import type { ResultRow } from "./entities";

interface ElectronAPI {
  selectDirectory: (title: string) => Promise<ResultRow | undefined>;
  selectParent: (parentId: number) => Promise<ResultRow | undefined>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

const api: ElectronAPI = {
  selectDirectory: (title: string) =>
    ipcRenderer.invoke("SELECT_DIRECTORY", title),
  selectParent: (parentId: number) =>
    ipcRenderer.invoke("SELECT_PARENT", parentId),
};

contextBridge.exposeInMainWorld("electron", api);
