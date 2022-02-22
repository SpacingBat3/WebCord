import { contextBridge, ipcRenderer } from "electron";
import { randomInt } from "crypto";
import { getAppIcon, wLog } from "../../global/global";
import desktopCapturerPicker from "../modules/capturer";
import preloadCosmetic from "../modules/cosmetic";
import l10n from "../../global/modules/l10n";

/**
 * Generates a safe random key that is not present in the API.
 */
function generateSafeKey () {
    const charset = 'abcdefghijklmnoprstuwxyzABCDEFGHIJKLMNOPRSTUWXYZ';
    let key = '';
    while(key === '' || key in window) {
        key = '';
        for(let i=0; i<=randomInt(4,32); i++)
            key += charset.charAt(randomInt(charset.length-1));
    }
    return key;
}
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