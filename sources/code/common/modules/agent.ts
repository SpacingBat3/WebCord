/*
 * Fake UserAgent generator (userAgent.js)
 */

import * as os from "os";

function getAgentArch() {
  switch (os.arch()) {
    case "arm64": return "aarch64";
    case "arm": return "armv7";
    case "ia32": return "x86";
    case "x64": return "x86_64";
    default: return os.arch();
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
 * @param platform A Node.js platform to use instead of the OS ones.
 * @returns Fake Chrome/Chromium user agent string.
 */
export function getUserAgent(chromeVersion: string, platform?: NodeJS.Platform):string {

  const userAgentPlatfom = platform ?? process.platform;
  let fakeUserAgent:string;
  const osVersion = (typeof process.getSystemVersion === "function" ?
    process.getSystemVersion() :
    (userAgentPlatfom === "darwin" ?  "12.0" : os.release())
  );
  let WOW64: string;
  switch (userAgentPlatfom) {
    case "darwin":
      fakeUserAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X ${osVersion.replace(".","_")}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      break;
    case "win32":
      osVersion.split(".")[0] === "10" ? WOW64 = "Win64; x64" : WOW64 = "WOW64";
      fakeUserAgent = "Mozilla/5.0 (Windows NT "+osVersion+"; "+WOW64+") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"+chromeVersion+" Safari/537.36";
      break;
    case "android":
      fakeUserAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"+chromeVersion+" Mobile Safari/537.36";
      break;
    default:
      fakeUserAgent = "Mozilla/5.0 (X11; "+os.type()+" "+getAgentArch()+") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"+chromeVersion+" Safari/537.36";
  }
  return fakeUserAgent;
}
