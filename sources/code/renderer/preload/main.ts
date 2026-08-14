import { contextBridge, ipcRenderer as ipc } from "electron/renderer";
import { generateSafeKey, navigate } from "../modules/api";
import { wLog } from "../../common/global";
import { appInfo } from "../../common/modules/client";
import L10N from "../../common/modules/l10n";

if (window.location.protocol === "file:") {
  window.addEventListener("load", () => {
    const element = document.getElementById("logo");
    if(element instanceof HTMLImageElement)
      element.src = appInfo.icons.app.toDataURL();
  });
  contextBridge.exposeInMainWorld(
    "webcord",
    {
      l10n: (new L10N()).web
    }
  );
} else {
  /**
   * WebCord API key used as the object name of the exposed content
   * by the Context Bridge.
   */
  const contextBridgeApiKey = generateSafeKey();

  /*
   * Expose API key back to the main process.
   */
  ipc.send("api-exposed", contextBridgeApiKey);

  /*
   * Hide orange popup about downloading the application.
   */
  window.addEventListener("load", () => window.localStorage.setItem("hideNag", "true"));

  /*
   * Handle WebSocket Server IPC communication
   */
  ipc.on("navigate", (_event, path:string) => {
    navigate(path);
  });
}

wLog("Everything has been preloaded successfully!");