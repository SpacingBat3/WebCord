/*
 * Fake UserAgent generator (userAgent.js)
 */

import {release} from "os";

function getAgentArch(arch: string): string {
  switch (arch as NodeJS.Architecture) {
    case "arm64": return "aarch64";
    case "arm": return "armv7";
    case "ia32": return "x86";
    case "x64": return "x86_64";
    default: return arch;
  }
}

/**
 * Generates fake Chrome/Chromium user agent string to use instead Electron ones.
 * 
 * This way, pages indentifies Electron client as regular Chromium browser.
 * 
 * To make it even harder to detect, it even uses current operating system version in
 * the user agent string (via `process.getSystemVersion()` in Electron API).
 * 
 * @param chromeVersion Chome/Chromium version string to use.
 * @param mobile Whenever user-agent should be for mobile devices.
 * @param replace Genarate user-agent from provided `replace` data.
 * @returns Fake Chrome/Chromium user agent string.
 */
export function getUserAgent(chromeVersion: string, mobile?: boolean, replace?: {platform: string; version: string; device?: string}):string {
  const userAgentPlatform = replace?.platform ?? process.platform;
  let fakeUserAgent:string;
  const osVersion:string = replace?.version ?? (typeof process.getSystemVersion === "function" ?
    process.getSystemVersion() :
    (userAgentPlatform === "darwin" ? "12.0" : release())
  );
  let WOW64: string;
  const device:string = (replace?.device !== undefined ? "; "+replace.device : "");
  const mobileAgent = (mobile??false) ? " Mobile" : "";
  switch (userAgentPlatform as NodeJS.Platform) {
    case "darwin":
      fakeUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X "+osVersion.replace(".","_")+") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"+chromeVersion+mobileAgent+" Safari/537.36";
      break;
    case "win32":
      osVersion.split(".")[0] === "10" ? WOW64 = "Win64; x64" : WOW64 = "WOW64";
      fakeUserAgent = "Mozilla/5.0 (Windows NT "+osVersion+"; "+WOW64+") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"+chromeVersion+mobileAgent+" Safari/537.36";
      break;
    case "android":
      fakeUserAgent = "Mozilla/5.0 (Linux; Android "+osVersion+device+") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"+chromeVersion+mobileAgent+" Safari/537.36";
      break;
    default:
      fakeUserAgent = "Mozilla/5.0 (X11; "+userAgentPlatform+" "+getAgentArch(process.arch)+") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"+chromeVersion+mobileAgent+" Safari/537.36";
  }
  return fakeUserAgent;
}
