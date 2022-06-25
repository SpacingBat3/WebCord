import { contextBridge, ipcRenderer } from "electron/renderer";
import { clipboard } from "electron/common";
import { generateSafeKey, navigate } from "../modules/api";
import { getAppIcon, wLog } from "../../common/global";
import desktopCapturerPicker from "../modules/capturer";
import l10n from "../../common/modules/l10n";

/**
 * WebCord API key used as the object name of the exposed content
 * by the Context Bridge.
 */
const contextBridgeApiKey = generateSafeKey();
contextBridge.exposeInMainWorld(contextBridgeApiKey,desktopCapturerPicker);

/*
 * Hide orange popup about downloading the application.
 */
window.addEventListener("load", () => window.localStorage.setItem('hideNag', 'true'));

/*
 * Workaround for clipboard content.
 */
document.addEventListener("paste", (event) => {
    const contentTypes = clipboard.availableFormats() as [string, string];
    if(contentTypes.length === 2 && contentTypes[0].startsWith("image/") && contentTypes[1] === "text/html") {
        console.debug("[WebCord] Applying clipboard workaround to the image…")
		// Electron will somehow sort the clipboard to parse it correctly.
		clipboard.write({
			image: clipboard.readImage(),
			html: clipboard.readHTML()
		})
        // Retry event, cancel other events.
        event.stopImmediatePropagation();
        ipcRenderer.send('paste-workaround')
    }
}, true);

if (window.location.protocol === 'file:') {
    window.addEventListener("load", () => {
        const element = document.getElementById("logo")
        if(element && element.tagName === "IMG")
            (element as HTMLImageElement).src = getAppIcon([512,256,192]);
    });
    contextBridge.exposeInMainWorld(
        'webcord',
        {
            l10n: (new l10n()).web
        }
    );
}
ipcRenderer.send('api-exposed', contextBridgeApiKey);

/*
 * Handle WebSocket Server IPC communication 
 */
ipcRenderer.on("navigate", (_event, path:string) => {
    navigate(path);
})

wLog("Everything has been preloaded successfully!");