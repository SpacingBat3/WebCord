import { ipcMain } from "electron/main";
import { AppConfig } from "../modules/config";
import { appInfo } from "../../common/modules/client";
import l10n from "../../common/modules/l10n";
import { initWindow } from "../modules/parent";
import { deepmerge } from "deepmerge-ts";

type generatedConfig = AppConfig["defaultConfig"]["settings"] & l10n["settings"] & {
  advanced: {
    cspThirdParty: {
      labels: Record<keyof Omit<AppConfig["defaultConfig"]["settings"]["advanced"]["cspThirdParty"], "labels">, string>
    }
  }
}

function generateConfig (config:AppConfig) {
  const lang = (new l10n()).settings;
  const appConfig = deepmerge((new l10n()).settings, config.get().settings);
  const finalConfig: Partial<generatedConfig> = appConfig as object;
  const websitesThirdParty = [
    ["algolia", "Algolia"],
    ["spotify", "Spotify"],
    ["hcaptcha", "hCaptcha"],
    ["paypal", "PayPal"],
    ["gif", lang.advanced.cspThirdParty.labels.gif],
    ["youtube", "YouTube"],
    ["twitter", "Twitter"],
    ["twitch", "Twitch"],
    ["streamable", "Streamable"],
    ["vimeo", "Vimeo"],
    ["audius", "Audius"],
    ["soundcloud", "SoundCloud"],
    ["reddit", "Reddit"]
  ] as const;
  // Append more third-party sites labels.
  websitesThirdParty.map(stringGroup => {
    if(finalConfig?.advanced?.cspThirdParty?.labels && !finalConfig.advanced.cspThirdParty.labels[stringGroup[0]])
      finalConfig.advanced.cspThirdParty.labels[stringGroup[0]] = stringGroup[1]
  });
  // Append name from CSP.
  if(finalConfig?.advanced?.cspThirdParty?.name)
    finalConfig.advanced.cspThirdParty.name = appConfig.advanced.csp.name + " – " + appConfig.advanced.cspThirdParty.name
  return finalConfig as generatedConfig;
}

export type htmlConfig = [
  generatedConfig["general"],
  generatedConfig["privacy"],
  generatedConfig["advanced"]
]

export default function loadSettingsWindow(parent:Electron.BrowserWindow):Electron.BrowserWindow|void {
  const config = generateConfig(new AppConfig());
  const htmlConfig:htmlConfig = [
    config.general,
    config.privacy,
    config.advanced
  ]
  if(!parent.isVisible()) parent.show();
  const settingsWindow = initWindow("settings", parent, {
    minWidth: appInfo.minWinWidth,
    minHeight: appInfo.minWinHeight,
  })
  if(settingsWindow === undefined) return;
  ipcMain.handle("settings-generate-html", () => {
    if(!settingsWindow.isDestroyed()) settingsWindow.show();
    return htmlConfig;
  })
  return settingsWindow;
}

ipcMain.on("settings-config-modified", (_event, config:AppConfig["defaultConfig"])=> {
  new AppConfig().set(config);
})