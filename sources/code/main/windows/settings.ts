import { ipcMain } from "electron/main";
import { appInfo } from "../../common/modules/client";
import L10N from "../../common/modules/l10n";
import { initWindow } from "../modules/parent";
import { deepmerge } from "deepmerge-ts";
import type { cspTP, AppConfig } from "../modules/config";
import type { PartialRecursive } from "../../common/global";
import { appConfig } from "../modules/config";

type generatedConfig = AppConfig["settings"] & L10N["settings"] & {
  advanced: {
    cspThirdParty: {
      labels: Record<keyof Omit<AppConfig["settings"]["advanced"]["cspThirdParty"], "labels">, string>;
      info: Record<keyof Omit<AppConfig["settings"]["advanced"]["cspThirdParty"], "labels">, string>;
    };
  };
};

function generateConfig () {
  const config = deepmerge(appConfig.value.settings, new L10N().settings);
  const finalConfig: PartialRecursive<generatedConfig> = config satisfies object;
  const websitesThirdParty = Object.freeze(({
    algolia: "Algolia",
    spotify: "Spotify",
    hcaptcha: "hCaptcha",
    paypal: "PayPal",
    audius: "Audius",
    gif: "Klipy",
    reddit: "Reddit",
    soundcloud: "SoundCloud",
    streamable: "Streamable",
    twitch: "Twitch",
    twitter: "Twitter",
    vimeo: "Vimeo",
    youtube: "YouTube",
    googleStorageApi: "Google Storage API"
  } as const) satisfies cspTP<string>);
  // Append more third-party sites labels.
  (Object.entries as <T extends object>(o: T) => [keyof T,T[keyof T]][])(websitesThirdParty)
  .map(stringGroup => {
    if(finalConfig.advanced?.cspThirdParty?.labels && finalConfig.advanced.cspThirdParty.labels[stringGroup[0]] === undefined)
      finalConfig.advanced.cspThirdParty.labels[stringGroup[0]] = stringGroup[1];
  });
  // Append name from CSP.
  if(finalConfig.advanced?.cspThirdParty?.name !== undefined)
    finalConfig.advanced.cspThirdParty.name = config.advanced.csp.name + " – " + config.advanced.cspThirdParty.name;
  return finalConfig as generatedConfig;
}

type htmlConfigElement<T extends keyof generatedConfig> = readonly [T,generatedConfig[T]];

export type htmlConfig = readonly (
  Exclude<keyof generatedConfig, `$${string}`> extends infer T extends keyof generatedConfig ? htmlConfigElement<T> : never
)[];

export default function loadSettingsWindow(parent:Electron.BrowserWindow):Electron.BrowserWindow|undefined {
  const config = generateConfig();
  const htmlConfig = Object.freeze([
    Object.freeze(["general", config.general] as const),
    Object.freeze(["privacy", config.privacy] as const),
    Object.freeze(["advanced", config.advanced] as const)
  ] as const) satisfies htmlConfig;
  if(!parent.isVisible()) parent.show();
  const settingsWindow = initWindow("settings", parent, {
    minWidth: appInfo.minWinWidth,
    minHeight: appInfo.minWinHeight,
  });
  if(settingsWindow === undefined) return undefined;
  ipcMain.handle("settings-generate-html", (event) => {
    if(event.senderFrame && new URL(event.senderFrame.url).protocol !== "file:")
      return undefined;
    if(!settingsWindow.isDestroyed()) settingsWindow.show();
    return htmlConfig;
  });
  settingsWindow.once("closed", () => {
    ipcMain.removeHandler("settings-generate-html");
  });
  return settingsWindow;
}