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

const defaultBuildInfo: buildInfo = {
  type: "devel",
  ...(process.platform === "win32" ? {AppUserModelId: "SpacingBat3.WebCord"} : {}),
  features: {
    updateNotifications: false
  }
};

/**
 * Resolves the `buildInfo` using the file (for compatibility reasons and sake
 * of simplicity for the packagers, it assumes it is a partial file – any values
 * can be ommited, but the config itself still needs to be of valid types) and
 * default values. */
export function getBuildInfo(): buildInfo {
  try {
    const data = readFileSync(resolve(getAppPath(), "buildInfo.json"));
    const buildInfo:unknown = JSON.parse(data.toString());
    if (isPartialBuildInfo(buildInfo))
      return deepmerge(defaultBuildInfo, buildInfo) as buildInfo;
    else
      return defaultBuildInfo;
  } catch {
    return defaultBuildInfo;
  }
}

/** Basic application details. */
export const appInfo = {
  /** Application repository details */
  repository: {
    /** Repository indentifier in format `author/name`. */
    name: new Person(packageJson.data.author ?? "").name + "/" + getName(),
    /** Web service on which app repository is published. */
    provider: "github.com"
  },
  icon: nativeImage.createFromPath(resolve(getAppPath(), "sources/assets/icons/app.png")),
  trayIcon: nativeImage.createFromPath(resolve(getAppPath(), "sources/assets/icons/tray.png")),
  trayUnread: nativeImage.createFromPath(resolve(getAppPath(), "sources/assets/icons/tray-unread.png")),
  trayPing: nativeImage.createFromPath(resolve(getAppPath(), "sources/assets/icons/tray-ping.png")),
  minWinHeight: 412,
  minWinWidth: 312,
  backgroundColor: "#36393F"
} as const;