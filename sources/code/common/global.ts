/*
 * Global.ts – non-Electron depending globally-used module declarations
 */

import type { Config } from "dompurify";
import type { HookFn, HookSignatures } from "@spacingbat3/disconnection";

/**
 * Outputs a fancy log message in the (DevTools) console.
 *
 * @param msg Message to log in the console.
 */

export function wLog(msg: string): void {
  console.log("%c[WebCord]", "color: #69A9C1", msg);
}

/**
 * Allowed protocol list.
 *
 * For security reasons, `shell.openExternal()` should not be used for every
 * link protocol handling, as this may allow potential attackers to compromise
 * host or even execute arbitary commands.
 *
 * This way, we can also force the usage of the secure links variants where
 * applicable and block *insecure* and unencrypted protocols.
 *
 * See:
 * https://www.electronjs.org/docs/tutorial/security#14-do-not-use-openexternal-with-untrusted-content
 */
export const protocols = Object.freeze({
  secure: Object.freeze(["https:","mailto:","tel:","sms:"]),
  allowed: Object.freeze(["http:"])
});

/**
 * Two-dimensional array of known Discord instances, including the official
 * ones.
 */
export const knownInstancesList = Object.freeze([
  /* NAME                                    URL                           ACTIVE */
  ["Discord",                  new URL("https://discord.com/app"),           true ],
  ["Discord Canary",           new URL("https://canary.discord.com/app"),    true ],
  ["Discord Public Test Beta", new URL("https://ptb.discord.com/app"),       true ]
] as const) satisfies readonly (readonly [ name: string, url: URL, active: boolean ])[];

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
    switch ((object as Partial<BuildInfo>).type) {
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

/**
 * A sanitizer configuration that allows only for tags that modifies the code
 * formatting.
 */
export const sanitizeConfig = Object.freeze({
  /** Allow tags that modifies text style and/or has a semantic meaning. */
  ALLOWED_TAGS: ["b", "i", "u", "s", "em", "kbd", "strong", "code", "small", "br"],
  /** Block every attribute */
  ALLOWED_ATTR: []
} satisfies {
  readonly [P in keyof Config]: Config[P] extends (infer T)[]|infer H ? readonly T[]|H : Config[P]
});

/**
 * Like {@link Partial<T>}, except it also makes all subproperties in `T`
 * optional.
 */
export type PartialRecursive<T> = {
  [P in keyof T]?: PartialRecursive<T[P]>
};

interface TypeMergeConfig {
  /** A class which can replace `null` values in source object. */
  nullType?: object;
}

/**
 * Merges deeply objects, but tries to preserve the type of the first ones. This
 * has currently a few assumptions:
 *
 * 1. `Array` aren't merged at all.
 * 2. Only primitive `Object` can be deeply merged.
 * 3. Other values are assigned by type.
 *
 * **Note:** Values of same type are expected to have the same constructors.
 *
 * @param source Object used as a type source.
 * @param objects Objects to merge (at least one).
 * @returns Merged object.
 *
 * @todo More accurate types (e.g. literals to primitives)
 */
export function typeMerge<T extends object>(source: T, config: TypeMergeConfig, ...objects:unknown[]&[unknown]) {
  const hasOwn = Object.hasOwn as <T>(o:T,s:string|symbol|number)=>s is keyof T;
  const typeOf = (o1:unknown,c:unknown) => (o1?.constructor ?? o1) === c;
  function deepMerge<T>(source:T,object:unknown) {
    const result = {...source};
    if(!(source instanceof Object) || !(object instanceof Object))
      return source;
    (Object.keys(source)
      .filter(
        key => hasOwn(source as T,key) && hasOwn(object,key) && (
          typeOf(source[key],(object[key] as unknown)?.constructor) || (config.nullType !== undefined ?
            (source[key] as unknown) === null && (object[key] as unknown)?.constructor === config.nullType :
            false
          )
        ) && !Array.isArray(source)
      ) as (keyof T)[])
      .map(key => {
        if(typeOf(source[key],Object))
          result[key] = deepMerge(source[key], object[key as keyof object]);
        else
          result[key] = object[key as keyof object] as T[typeof key];
      });
    return result;
  }
  return (objects as T[])
    .reduce((prev, cur:unknown) => deepMerge(prev, cur), source);
}

export function wordWrap(long:string,maxr:number,maxc:number):string {
  let res="",pieces = Math.floor(long.length/maxr);
  const shorten = pieces > maxc;
  pieces = shorten ? maxc : pieces;
  for(let i=0;i<pieces;++i)
    res+=`${res===""?"":"\n"}${long.substring(i*maxr,i*maxr+maxr)}`;
  if(shorten) res+=" (…)";
  if(res === "")
    return long;
  return res;
}

/** A definitions for default font families that will be used in Electron. */
export const fonts = Object.freeze({
  standard: process.platform === "win32" ? "Segoe UI" as const :
    process.platform === "darwin" ? "SF Pro" as const : "Sans" as const,
  sansSerif: process.platform === "win32" ? "Segoe UI" as const :
    process.platform === "darwin" ? "SF Pro" as const : "Sans" as const,
  serif: process.platform === "win32" ? "Times New Roman" as const :
    process.platform === "darwin" ? "New York" as const : "Serif" as const,
  monospace: process.platform === "win32" ? "Cascadia Code" as const :
    process.platform === "darwin" ? "SF Pro" as const : "Monospace" as const
} satisfies Electron.DefaultFontFamily);

type hookName = keyof HookSignatures;

interface WsCmd {
  evt: `hook-${string}`;
  hook: hookName;
}

export interface WSHookAdd extends WsCmd {
  evt: "hook-set";
}

export interface WSHookTrigger<T extends hookName> extends WsCmd {
  evt: "hook-trigger";
  hook: T;
  data: HookSignatures[T];
  nonce: number;
  port?: number|undefined;
}

export interface WSHookReturn<T extends hookName> extends WsCmd {
  evt: "hook-return";
  hook: T;
  data: Awaited<ReturnType<HookFn<T>>>|Error;
  nonce: number;
}