/*
 * Declarations used between multiple files (main scripts only)
 */
import { nativeImage } from "electron/common";
import { getAppPath, getName } from "./electron";
import { resolve } from "path";
import { BuildInfo, typeMerge, isPartialBuildInfo } from "../global";
import packageJson, { Person } from "./package";
import { readFileSync } from "fs";

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

export const defaultBuildInfo = Object.freeze({
  type: "devel",
  ...(process.platform === "win32" ? {AppUserModelId: "SpacingBat3.WebCord"} : {}),
  features: {
    updateNotifications: false
  }
} as const satisfies Readonly<BuildInfo>);

/**
 * Resolves the `buildInfo` using the file (for compatibility reasons and sake
 * of simplicity for the packagers, it assumes it is a partial file – any values
 * can be ommited, but the config itself still needs to be of valid types) and
 * default values. */
export function getBuildInfo(): Readonly<BuildInfo> {
  try {
    const data = readFileSync(resolve(getAppPath(), "buildInfo.json"));
    const buildInfo:unknown = JSON.parse(data.toString());
    if(isPartialBuildInfo(buildInfo))
      return Object.freeze(typeMerge(defaultBuildInfo, {}, buildInfo) as BuildInfo);
    else
      return defaultBuildInfo;
  } catch {
    return defaultBuildInfo;
  }
}

/** Basic application details. */
export const appInfo = Object.freeze({
  /** Application repository details */
  repository: {
    /** Repository indentifier in format `author/name`. */
    name: new Person(packageJson.data.author ?? "").name + "/" + getName(),
    /** Web service on which app repository is published. */
    provider: "github.com"
  },
  icons: {
    app: generateIcon(Icon.App),
    tray: {
      default: generateIcon(Icon.Tray),
      unread: generateIcon(Icon.TrayUnread),
      warn: generateIcon(Icon.TrayPing)
    }
  },
  minWinHeight: 412,
  minWinWidth: 312,
  backgroundColor: "#36393F"
} as const);