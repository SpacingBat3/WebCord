import { contextBridge, ipcRenderer } from "electron/renderer";
import { generateSafeKey } from "../modules/api";
import { getAppIcon, wLog } from "../../common/global";
import desktopCapturerPicker from "../modules/capturer";
import preloadCosmetic from "../modules/cosmetic";
import l10n from "../../common/modules/l10n";

/**
 * WebCord API key used as the object name of the exposed content
 * by the Context Bridge.
 */
const contextBridgeApiKey = generateSafeKey();
/*
 * Cosmetic script uses that to hide the Discord's download popup on fresh
 * installations.
 */
preloadCosmetic();
contextBridge.exposeInMainWorld(contextBridgeApiKey,desktopCapturerPicker);

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

wLog("Everything has been preloaded successfully!");