import { contextBridge, ipcRenderer as ipc } from "electron/renderer";
import { clipboard } from "electron/common";
import { generateSafeKey, navigate } from "../modules/api";
import { wLog } from "../../common/global";
import { appInfo } from "../../common/modules/client";
import desktopCapturerPicker from "../modules/capturer";
import l10n from "../../common/modules/l10n";

if (window.location.protocol === "file:") {
  window.addEventListener("load", () => {
    const element = document.getElementById("logo");
    if(element && element.tagName === "IMG")
      (element as HTMLImageElement).src = appInfo.icons.app.toDataURL();
  });
  contextBridge.exposeInMainWorld(
    "webcord",
    {
      l10n: (new l10n()).web
    }
  );
} else {
  /**
   * WebCord API key used as the object name of the exposed content
   * by the Context Bridge.
   */
  const contextBridgeApiKey = generateSafeKey();
  contextBridge.exposeInMainWorld(contextBridgeApiKey,() => desktopCapturerPicker(contextBridgeApiKey));

  /*
   * Expose API key back to the main process.
   */
  ipc.send("api-exposed", contextBridgeApiKey);

  /*
   * Custom title bar
   */
  ipc.on("createCustomBar", (_event) => {
    const titlebar = document.createElement('div');
    titlebar.className = 'titlebar';

    const title = document.createElement('div');
    // title.innerText = location.host.split('.')[0]!;
    title.innerText = 'webcord';
    title.className = 'title';
    const minimizebutton = document.createElement('div');
    minimizebutton.className = 'minimizebutton btn';
    const maximizebutton = document.createElement('div');
    maximizebutton.className = 'maximizebutton btn';
    const closebutton = document.createElement('div');
    closebutton.className = 'closebutton btn';
    closebutton.onclick = window.close;
    titlebar.appendChild(title);
    titlebar.appendChild(minimizebutton);
    titlebar.appendChild(maximizebutton);
    titlebar.appendChild(closebutton);
    document.body.insertBefore(titlebar, document.body.firstChild);
    title.onclick = function () {
      ipc.send("opensettings", contextBridgeApiKey);
    }
    minimizebutton.onclick = function () {
      ipc.send("window-minimize", contextBridgeApiKey);
    }
    maximizebutton.onclick = function () {
      ipc.send("window-maximize", contextBridgeApiKey);
    }
  });

  /*
   * Hide orange popup about downloading the application.
   */
  window.addEventListener("load", () => window.localStorage.setItem("hideNag", "true"));

  /*
  * Workaround for clipboard content.
  */
  {
    let lock = true;
    document.addEventListener("paste", (event) => {
      const contentTypes = clipboard.availableFormats() as []|[string, string];
      if(contentTypes.length === 2 && contentTypes[0].startsWith("image/") &&
          contentTypes[1] === "text/html" && lock) {
        console.debug("[WebCord] Applying clipboard workaround to the image…");
        lock = false;
        // Electron will somehow sort the clipboard to parse it correctly.
        clipboard.write({
          image: clipboard.readImage(),
          html: clipboard.readHTML()
        });
        // Retry event, cancel other events.
        event.stopImmediatePropagation();
        ipc.send("paste-workaround", contextBridgeApiKey);
        return;
      }
      lock = true;
      return;
    }, true);
  }

  /*
   * Handle WebSocket Server IPC communication 
   */
  ipc.on("navigate", (_event, path:string) => {
    navigate(path);
  });
}

wLog("Everything has been preloaded successfully!");