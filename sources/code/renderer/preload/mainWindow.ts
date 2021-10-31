import { contextBridge, ipcRenderer } from "electron";
import { randomBytes } from "crypto";
import { wLog } from "../../global";
import desktopCapturerPicker from "../modules/capturer";
import preloadCosmetic from "../modules/cosmetic";
import l10n from "../../modules/l10nSupport";

/**
 * WebCord API key used as the object name of the exposed content
 * by the Context Bridge.
 */
 const contextBridgeApiKey = "__"+randomBytes(32).toString('base64')+"__"

/* 
 * Hence Discord removes localStorage, expose it for the preloads
 * before it does anything (breaking) to it (it will be removed later anyway).
 * 
 * With exposing this, preloads are able to access the user token
 * programatically for use with some functionalities like RPC
 * (which could be the reason why they started to block it).
 */
const localStorage = window.localStorage

preloadCosmetic(localStorage);

contextBridge.exposeInMainWorld(
    contextBridgeApiKey,
    {
        desktopCapturerPicker: desktopCapturerPicker
    }
)

if(window.location.protocol === 'file:')
    contextBridge.exposeInMainWorld(
        'webcord',
        {
            l10n: (new l10n()).web
        }
    )

ipcRenderer.send('api-exposed', contextBridgeApiKey)

wLog("Everything has been preloaded successfully!");