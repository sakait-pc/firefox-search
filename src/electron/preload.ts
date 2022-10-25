import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  selectMock: () => ipcRenderer.invoke("SELECT_MOCK"),
});
