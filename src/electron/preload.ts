import { ipcRenderer, contextBridge } from "electron";
import type { ResultRow, MatchType, TargetType } from "./entities";

interface ElectronAPI {
  select: (
    title: string,
    match: MatchType,
    target: TargetType
  ) => Promise<Array<ResultRow>>;
  selectParent: (parentId: number) => Promise<ResultRow | undefined>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

const api: ElectronAPI = {
  select: (title: string, match: MatchType, target: TargetType) =>
    ipcRenderer.invoke("SELECT", title, match, target),
  selectParent: (parentId: number) =>
    ipcRenderer.invoke("SELECT_PARENT", parentId),
};

contextBridge.exposeInMainWorld("electron", api);
