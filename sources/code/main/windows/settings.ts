import { ipcMain } from "electron/main";
import { AppConfig } from "../modules/config";
import { appInfo } from "../../common/modules/client";
import L10N from "../../common/modules/l10n";
import { initWindow } from "../modules/parent";
import { deepmerge } from "deepmerge-ts";
import type { cspTP } from "../modules/config";
import type { PartialRecursive } from "../../common/global";

type generatedConfig = AppConfig["defaultConfig"]["settings"] & L10N["settings"] & {
  advanced: {
    cspThirdParty: {
      labels: Record<keyof Omit<AppConfig["defaultConfig"]["settings"]["advanced"]["cspThirdParty"], "labels">, string>;
    };
  };
};

function generateConfig (config:AppConfig) {
  const appConfig = deepmerge(config.value.settings, (new L10N()).settings);
  const finalConfig: PartialRecursive<generatedConfig> = appConfig as object;
  const websitesThirdParty = Object.freeze(({
    algolia: "Algolia",
    spotify: "Spotify",
    hcaptcha: "hCaptcha",
    paypal: "PayPal",
    audius: "Audius",
    gif: appConfig.advanced.cspThirdParty.labels.gif,
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
  Object.entries(websitesThirdParty).map(stringGroup => {
    if(finalConfig.advanced?.cspThirdParty?.labels && finalConfig.advanced.cspThirdParty.labels[stringGroup[0] as keyof cspTP<string>] === undefined)
      finalConfig.advanced.cspThirdParty.labels[stringGroup[0] as keyof cspTP<string>] = stringGroup[1];
  });
  // Append name from CSP.
  if(finalConfig.advanced?.cspThirdParty?.name !== undefined)
    finalConfig.advanced.cspThirdParty.name = appConfig.advanced.csp.name + " – " + appConfig.advanced.cspThirdParty.name;
  return finalConfig as generatedConfig;
}

type htmlConfigElement<T extends keyof generatedConfig> = readonly [T,generatedConfig[T]];

export type htmlConfig = readonly (
  Exclude<keyof generatedConfig, `$${string}`> extends infer T extends keyof generatedConfig ? htmlConfigElement<T> : never
)[];

export default function loadSettingsWindow(parent:Electron.BrowserWindow):Electron.BrowserWindow|undefined {
  const config = generateConfig(new AppConfig());
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
  if(settingsWindow === undefined) return;
  ipcMain.handle("settings-generate-html", (event) => {
    if(new URL(event.senderFrame.url).protocol !== "file:") return;
    if(!settingsWindow.isDestroyed()) settingsWindow.show();
    return htmlConfig;
  });
  settingsWindow.once("closed", () => {
    ipcMain.removeHandler("settings-generate-html");
  });
  return settingsWindow;
}