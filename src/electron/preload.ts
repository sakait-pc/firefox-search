import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  selectDirectory: (title: string) =>
    ipcRenderer.invoke("SELECT_DIRECTORY", title),
});
