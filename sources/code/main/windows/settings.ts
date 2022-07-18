import { ipcMain } from "electron/main";
import { AppConfig } from "../modules/config";
import { appInfo } from "../../common/modules/client";
import l10n from "../../common/modules/l10n";
import { initWindow } from "../modules/parent";
import { deepmerge } from "deepmerge-ts";
import type { cspTP } from "../modules/config";

type generatedConfig = AppConfig["defaultConfig"]["settings"] & l10n["settings"] & {
  advanced: {
    cspThirdParty: {
      labels: Record<keyof Omit<AppConfig["defaultConfig"]["settings"]["advanced"]["cspThirdParty"], "labels">, string>
    }
  }
}

function generateConfig (config:AppConfig) {
  const appConfig = deepmerge(config.get().settings, (new l10n()).settings);
  const finalConfig: Partial<generatedConfig> = appConfig as object;
  const websitesThirdParty: cspTP<string> = {
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
  };
  // Append more third-party sites labels.
  Object.entries(websitesThirdParty).map(stringGroup => {
    if(finalConfig?.advanced?.cspThirdParty?.labels && !finalConfig.advanced.cspThirdParty.labels[stringGroup[0] as keyof cspTP<string>])
      finalConfig.advanced.cspThirdParty.labels[stringGroup[0] as keyof cspTP<string>] = stringGroup[1];
  });
  // Append name from CSP.
  if(finalConfig?.advanced?.cspThirdParty?.name)
    finalConfig.advanced.cspThirdParty.name = appConfig.advanced.csp.name + " – " + appConfig.advanced.cspThirdParty.name;
  return finalConfig as generatedConfig;
}

export type htmlConfig = [
  ["general", generatedConfig["general"]],
  ["privacy", generatedConfig["privacy"]],
  ["advanced", generatedConfig["advanced"]]
]

export default function loadSettingsWindow(parent:Electron.BrowserWindow):Electron.BrowserWindow|void {
  const config = generateConfig(new AppConfig());
  const htmlConfig:htmlConfig = [
    ["general", config.general],
    ["privacy", config.privacy],
    ["advanced", config.advanced]
  ];
  if(!parent.isVisible()) parent.show();
  const settingsWindow = initWindow("settings", parent, {
    minWidth: appInfo.minWinWidth,
    minHeight: appInfo.minWinHeight,
  });
  if(settingsWindow === undefined) return;
  ipcMain.handle("settings-generate-html", () => {
    if(!settingsWindow.isDestroyed()) settingsWindow.show();
    return htmlConfig;
  });
  settingsWindow.once("closed", () => {
    ipcMain.removeHandler("settings-generate-html");
  });
  return settingsWindow;
}