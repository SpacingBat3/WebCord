/*
 * Declarations used between multiple files (main scripts only)
 */

import { getAppPath, getName } from "./electron";
import { resolve } from "path";
import { buildInfo, isBuildInfo } from "../global";
import packageJson, { Person } from "./package";
import { readFileSync } from "fs";

export function getBuildInfo(): buildInfo {
  try {
    const data = readFileSync(resolve(getAppPath(), "buildInfo.json"));
    let buildInfo:unknown = JSON.parse(data.toString());
    if(process.platform === "win32" && buildInfo instanceof Object)
      buildInfo = {...buildInfo, ...{AppUserModelId: appInfo.id.win32}};
    if (isBuildInfo(buildInfo))
      return buildInfo;
    else
      return { type: "devel" };
  } catch {
    return { type: "devel" };
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
  icon: resolve(getAppPath(), "sources/assets/icons/app.png"),
  trayIcon: resolve(getAppPath(), "sources/assets/icons/tray.png"),
  trayUnread: resolve(getAppPath(), "sources/assets/icons/tray-unread.png"),
  trayPing: resolve(getAppPath(), "sources/assets/icons/tray-ping.png"),
  minWinHeight: 412,
  minWinWidth: 312,
  backgroundColor: "#36393F",
  id: {
    win32: "SpacingBat3.WebCord"
  }
} as const;