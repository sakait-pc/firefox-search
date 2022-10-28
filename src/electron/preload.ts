import { ipcRenderer, contextBridge } from "electron";
import type { ResultRow, MatchType, ExactType } from "./entities";

interface ElectronAPI {
  select: (
    title: string,
    match: MatchType,
    type: ExactType
  ) => Promise<Array<ResultRow>>;
  selectParent: (parentId: number) => Promise<ResultRow | undefined>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

const api: ElectronAPI = {
  select: (title: string, match: MatchType, type: ExactType) =>
    ipcRenderer.invoke("SELECT", title, match, type),
  selectParent: (parentId: number) =>
    ipcRenderer.invoke("SELECT_PARENT", parentId),
};

contextBridge.exposeInMainWorld("electron", api);
