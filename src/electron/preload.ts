import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  selectDirectory: (title: string) =>
    ipcRenderer.invoke("SELECT_DIRECTORY", title),
  selectParent: (parentId: number) =>
    ipcRenderer.invoke("SELECT_PARENT", parentId),
});
