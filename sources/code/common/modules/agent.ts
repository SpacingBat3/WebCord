/*
 * Fake UserAgent generator (userAgent.js)
 */

import {release} from "os";

type userAgentArch = "aarch64"|"armv7"|"x86"|"x86_64";
type userAgentNodejsArch = NodeJS.Architecture & ("arm64"|"arm"|"ia32"|"x64");

const agentArchMap = Object.freeze({
  arm64: "aarch64",
  arm: "armv7",
  ia32: "x86",
  x64: "x86_64"
} as unknown as Record<userAgentNodejsArch,userAgentArch>&Record<Exclude<NodeJS.Architecture,userAgentNodejsArch>,undefined>);

/**
 * Generates fake Chrome/Chromium user agent string to use instead Electron ones.
 * 
 * This way, pages identifies Electron client as regular Chromium browser.
 * 
 * To make it even harder to detect, it even uses current operating system version in
 * the user agent string (via `process.getSystemVersion()` in Electron API).
 * 
 * @param chromeVersion Chrome/Chromium version string to use.
 * @param mobile Whenever user-agent should be for mobile devices.
 * @param replace Generate user-agent from provided `replace` data.
 * @returns Fake Chrome/Chromium user agent string.
 */
export function getUserAgent(chromeVersion: string, mobile?: boolean, replace?: {platform: string; version: string; device?: string|undefined}) {
  const userAgentPlatform = replace?.platform ?? process.platform;
  const osVersion = replace?.version ?? (typeof process.getSystemVersion === "function" ?
    process.getSystemVersion() :
    (userAgentPlatform === "darwin" ? "13.5.2" : release())
  );
  const device = replace?.device !== undefined ? `; ${replace.device}` as const : "";
  const mobileAgent = (mobile??false) ? " Mobile" : "";
  switch (userAgentPlatform as NodeJS.Platform) {
    case "darwin":
      return `Mozilla/5.0 (Macintosh; Intel Mac OS X ${osVersion.replace(".","_")}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}${mobileAgent} Safari/537.36` as const;
    case "win32": {
      const wow64 = process.arch.endsWith("64") ? "Win64; x64" : "Win32";
      return `Mozilla/5.0 (Windows NT ${osVersion}; ${wow64}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}${mobileAgent} Safari/537.36` as const;
    }
    case "android":
      return `Mozilla/5.0 (Linux; Android ${osVersion}${device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}${mobileAgent} Safari/537.36` as const;
    default:
      return `Mozilla/5.0 (X11; ${userAgentPlatform} ${agentArchMap[process.arch]??process.arch}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}${mobileAgent} Safari/537.36` as const;
  }
}