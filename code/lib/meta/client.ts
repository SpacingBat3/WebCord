/*
 * Declarations used between multiple files (main scripts only)
 */
import { nativeImage } from "electron/common";
import { resolve } from "node:path";

import { getAppPath, getName } from "#esm:/lib/electron";
import packageJson, { Person } from "#esm:/lib/meta/package";
import type { satisfies } from "semver";

/** Icon names used in WebCord */
const enum Icon {
  App = "app",
  Tray = "tray",
  TrayUnread = "tray-unread",
  TrayPing = "tray-ping"
}

/** Generates `NativeIcon` which size is prefered for a given platform. */
function generateIcon(icon: Icon)  {
  const basePath = resolve(getAppPath(), "sources/assets/icons", icon)+".";
  switch(icon) {
    case Icon.App:
      return nativeImage.createFromPath(basePath+(process.platform === "win32" ? "ico" : "png"));
    case Icon.Tray:
    case Icon.TrayUnread:
    case Icon.TrayPing: {
      const image = nativeImage.createFromPath(basePath+"png");
      if(process.platform !== "win32" && process.platform !== "darwin")
        return image;
      const newImage = nativeImage.createEmpty();
      let sizes:[scaleFactor: number,height: number][];
      if(process.platform === "win32")
        sizes = [[1,16],[1.5,24],[2,32]];
      else
        sizes = [[1,22],[1.5,33],[2,44]];
      sizes.forEach(element => newImage.addRepresentation({
        scaleFactor: element[0],
        buffer: image.resize({height:element[1]}).toPNG(),
      }));
      return newImage;
    }
    default:
      throw new TypeError(`Invalid icon file name '${String(icon)}'.`);
  }
}

const corefonts = ["win32","darwin"].includes(process.platform);

/**
 * More reliable set of default fonts.
 * 
 * For *codefont platforms* (Windows,macOS) it uses default font names.
 * For FreeDesktop compilant OSes (most likely any Linux/BSD), it uses font
 * names that seem to be set by Fontconfig by default if any valid font pack
 * is present.
 */
const fallbackFonts = {
  sansSerif: corefonts ? "Arial" : "Sans",
  serif: corefonts ? "Times New Roman" : "Serif",
  monospace: corefonts ? "Courier New" : "Monospace"
} satisfies Omit<Electron.DefaultFontFamily, "standard">

/** Basic application details. */
const appInfo = Object.freeze({
  /** Application repository details */
  repository: Object.freeze({
    /** Repository indentifier in format `author/name`. */
    name: new Person(packageJson.data.author ?? "").name + "/" + getName(),
    /** Web service on which app repository is published. */
    provider: "github.com"
  }),
  icons: Object.freeze({
    app: generateIcon(Icon.App),
    tray: Object.freeze({
      default: generateIcon(Icon.Tray),
      unread: generateIcon(Icon.TrayUnread),
      warn: generateIcon(Icon.TrayPing)
    })
  }),
  minWinHeight: 412,
  minWinWidth: 312,
  backgroundColor: "#36393F",
  /** Default WebPreferences used in WebCord. */
  commonPrefs: {
    // Disable all prefs with node integration.
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    // Disable useless features / APIs
    enableWebSQL: false,
    navigateOnDragDrop: false,
    // Security / privacy features for remote pages
    safeDialogs: true,
    contextIsolation: true,
    autoplayPolicy: "document-user-activation-required",
    allowRunningInsecureContent: false,
    sandbox: true,
    // Use platform-specific font defaults
    defaultFontFamily: fallbackFonts,
    // Default encoding to potentially fix sites not setting it at all.
    defaultEncoding: "UTF-8",
  } satisfies Electron.WebPreferences
} as const);

export default appInfo;
export { appInfo };