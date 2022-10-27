import { ipcRenderer, contextBridge } from "electron";
import type { ResultRow, ExactType } from "./entities";

interface ElectronAPI {
  selectExact: (
    title: string,
    type: ExactType
  ) => Promise<ResultRow | undefined>;
  selectParent: (parentId: number) => Promise<ResultRow | undefined>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

const api: ElectronAPI = {
  selectExact: (title: string, type: ExactType) =>
    ipcRenderer.invoke("SELECT_EXACT", title, type),
  selectParent: (parentId: number) =>
    ipcRenderer.invoke("SELECT_PARENT", parentId),
};

contextBridge.exposeInMainWorld("electron", api);
