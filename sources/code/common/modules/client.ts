/*
 * Declarations used between multiple files (main scripts only)
 */
import { nativeImage } from "electron/common";
import { getAppPath, getName } from "./electron";
import { deepmerge } from "deepmerge-ts";
import { resolve } from "path";
import { buildInfo, isPartialBuildInfo } from "../global";
import packageJson, { Person } from "./package";
import { readFileSync } from "fs";

/** Generates `NativeIcon` which size is prefered for a given platform. */
function generateIcon(set: "application"|"tray", variant?: "unread"|"ping")  {
  switch(set) {
    case "application": {
      const preferExt = process.platform === "win32" ? "ico" : "png";
      const path = resolve(getAppPath(), "sources/assets/icons/app."+preferExt);
      return nativeImage.createFromPath(path);
    }
    case "tray": {
      const type = variant === "ping"||variant === "unread" ? "-"+variant as `-${typeof variant}` : "";
      const image = nativeImage.createFromPath(resolve(getAppPath(), "sources/assets/icons/tray"+type+".png"));
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
      throw new TypeError("Invalid set: "+String(set));
  }
}

export const defaultBuildInfo: Readonly<buildInfo> = Object.freeze({
  type: "devel",
  ...(process.platform === "win32" ? {AppUserModelId: "SpacingBat3.WebCord"} : {}),
  features: {
    updateNotifications: false
  }
});

/**
 * Resolves the `buildInfo` using the file (for compatibility reasons and sake
 * of simplicity for the packagers, it assumes it is a partial file – any values
 * can be ommited, but the config itself still needs to be of valid types) and
 * default values. */
export function getBuildInfo(): Readonly<buildInfo> {
  try {
    const data = readFileSync(resolve(getAppPath(), "buildInfo.json"));
    const buildInfo:unknown = JSON.parse(data.toString());
    if (isPartialBuildInfo(buildInfo))
      return Object.freeze(deepmerge(defaultBuildInfo, buildInfo) as buildInfo);
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
    app: generateIcon("application"),
    tray: {
      default: generateIcon("tray"),
      unread: generateIcon("tray", "unread"),
      warn: generateIcon("tray", "ping")
    }
  },
  minWinHeight: 412,
  minWinWidth: 312,
  backgroundColor: "#36393F"
});