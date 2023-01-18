import { resolve } from "node:path";
import { readFileSync } from "node:fs";

import { typeMerge } from "#esm:/lib/base";
import { getAppPath } from "#esm:/lib/electron";

/**
 * An object which type includes information about the WebCord's build
 * configuration and metadata.
 */
export interface BuildInfo {
  /**
   * This build type. `devel` builds can have access to some features not meant
   * to be in the production and have access to DevTools by the default.
   */
  type: "release" | "devel";
  /**
   * Full commit hash, used for development builds packaged from git repository.
   */
  commit?: string | undefined;
  /**
   * Application-specific identifier specific to Windows platforms, it should be
   * `{Company}.{Product}[.SubProduct][.Version]` (all string slices should be
   *  in `PascalCase`). Defaults to `SpacingBat3.WebCord`. For forks and
   * community builds, the recommended value of `AppUserModelId` is
   * `{AuthorOrPackager}.WebCord` or `{Author}.{Name}`.
   * 
   * @platform win32
   */
  AppUserModelId?: string;
  /**
   * A list of features specific to this build.
   */
  features: {
    /**
     * Used to disable notifications on new WebCord releases. It does not
     * disable the update check through to still give an indication of used
     * version in logs.
     * 
     * Notifications should be only disabled for builds whose have a different
     * way of checking updates and/or updating the WebCord. This mostly applies
     * to UNIX repositories where the it is a duty of the package manager to
     * keep the package up-to-date with the upstream repository (in this case,
     * <https://github.com/SpacingBat3/WebCord.git>).
     */
    updateNotifications: boolean;
  };
}

export function isPartialBuildInfo(object: unknown): object is Partial<BuildInfo> {
  // #1 Element is object.
  if (!(object instanceof Object))
    return false;
  // #2 'type' property contains 'release' and 'devel' strings if defined.
  if("type" in object)
    switch ((object as BuildInfo).type) {
      case "release":
      case "devel":
        break;
      case undefined:
        break;
      default:
        return false;
    }
  // #3 If object contains 'commit' property, it should be of type 'string'.
  if ("commit" in object && !(typeof (object as BuildInfo).commit === "string"))
    return false;

  /** List of valid properties for the `.features` object. */
  const features = ["updateNotifications"];
  // #4 If object contains the 'features' property, it should be an object.
  if ("features" in object)
    if (!((object as BuildInfo).features instanceof Object))
      return false;
    else for(const property of features)
    // #5 `features` properties are of type `boolean`.
      if(Object.prototype.hasOwnProperty.call((object as {features:Record<string, unknown>}).features, property))
        if(typeof (object as {features:Record<string,unknown>}).features[property] !== "boolean")
          return false;

  // #6 On Windows, AppUserModelID should be of 'string' type
  if (process.platform === "win32" && !(typeof (object as BuildInfo).AppUserModelId === "string"))
    return false;
  return true;
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
export default function getBuildInfo(path = resolve(getAppPath(), "buildInfo.json")): Readonly<BuildInfo> {
  try {
    const data = readFileSync(path);
    const buildInfo:unknown = JSON.parse(data.toString());
    if(isPartialBuildInfo(buildInfo))
      return Object.freeze(typeMerge(defaultBuildInfo, {}, buildInfo) as BuildInfo);
    else
      return defaultBuildInfo;
  } catch {
    return defaultBuildInfo;
  }
}