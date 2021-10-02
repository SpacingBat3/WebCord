import { wLog } from "../../global";
import preloadCapturer from "../modules/capturer";
import preloadCosmetic from "../modules/cosmetic";

/* 
 * Hence Discord removes localStorage, expose it for the preloads
 * before it does anything (breaking) to it (it will be removed later anyway).
 * 
 * With exposing this, preloads are able to access the user token
 * programatically for use with some functionalities like RPC
 * (which could be the reason why they started to block it).
 */
const localStorage = window.localStorage

preloadCapturer();
preloadCosmetic(localStorage);

wLog("Everything has been preloaded successfully!");