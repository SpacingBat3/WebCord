/*
 * Fake UserAgent generator (userAgent.js)
 */

import { release } from "os";

const agentMap = new Map<NodeJS.Architecture,string>([
  ["arm64","aarch64"],
  ["arm","armv7"],
  ["x64","x86_64"],
  ["ia32","x86"]
]);

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
export function getUserAgent<V extends string, M extends boolean>(chromeVersion: V, mobile?: M, replace?: {platform: string; version: string; device?: string}) {
  const userAgentPlatform = replace?.platform ?? process.platform;
  const osVersion:string = replace?.version ?? (typeof process.getSystemVersion === "function" ?
    process.getSystemVersion() :
    (userAgentPlatform === "darwin" ? "12.0" : release())
  );
  const device:string = (replace?.device !== undefined ? "; "+replace.device : "");
  const mobileAgent = (mobile === true ? "Mobile" : "") as M extends true ? "Mobile" : "";
  switch (userAgentPlatform as NodeJS.Platform) {
    case "darwin":
      return `Mozilla/5.0 (Macintosh; Intel Mac OS X ${osVersion.replace(".","_")}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}${mobileAgent} Safari/537.36` as const
    case "win32":
      const wow64 = osVersion.split(".")[0] === "10" ? "Win64; x64" : "WOW64";
      return `Mozilla/5.0 (Windows NT ${osVersion}; ${wow64}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} ${mobileAgent} Safari/537.36` as const;
    case "android":
      return `Mozilla/5.0 (Linux; Android ${osVersion}${device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} ${mobileAgent} Safari/537.36` as const;
    default:
      return `Mozilla/5.0 (X11; ${userAgentPlatform} ${agentMap.get(process.arch)??process.arch}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} ${mobileAgent} Safari/537.36` as const;
  }
}
