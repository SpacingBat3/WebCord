/*
 * Global.ts – non-Electron depending globally-used module declarations
 */

/**
 * Outputs a fancy log message in the (DevTools) console.
 * 
 * @param msg Message to log in the console.
 */

export function wLog(msg: string): void {
  console.log("%c[WebCord]", "color: #69A9C1", msg);
}

export function isJsonSyntaxCorrect(string: string) {
  try {
    JSON.parse(string);
  } catch {
    return false;
  }
  return true;
}

/** SHA1 hashes of Discord favicons (in RAW bitmap format). */
export const discordFavicons = Object.freeze({
  /** Default favicon (without *blue dot* indicator). */
  default: "a2205eb4eb1cbf4ef7555e579bee3ba260574f3b", // seems always valid
  unread: [
    "ee9eef1403e76cb770d1c4a32265e8354e6af1a0", // works on FIFO pipe errors
    "40f51a9b9ad411d2e0e897661a08305b4a76ec76", // produced by older Electron releases
    "541317111758ff00613b2ff56f284a2474bd3d81"  // seems to be valid otherwise
  ]
});

/**
 * List of common GPU vendors based on integer indentifier.
 */
export const gpuVendors = Object.freeze({
  nvidia: 0x10DE,
  amd: 0x1002,
  intel: 0x8086
});

/**
 * A generic TypeGuard, used to deeply check if `object` can be merged with another
 * `object` without loosing the existing type structure.
 * 
 * @param object1 An object to check the type of.
 * @param object2 An object used for the type comparasion.
 */
export function objectsAreSameType<X,Y>(object1:X, object2:Y):object1 is X&Y {

  // False when parameters are not objects.
  if(!(object1 instanceof Object && object2 instanceof Object)) return false;
	
  // True when parameters are exactly same objects.
  if(JSON.stringify(object1) === JSON.stringify(object2)) return true;

  const results = Object.keys({...object1,...object2}).map(key => {
    if(key in object1 && key in object2) {
      const key1:unknown = object1[key as keyof unknown], key2:unknown = object2[key as keyof unknown];
      if(typeof (key1 === null ? false : key1) === typeof (key2 === null ? false : key2)) {
        if(typeof key1 === "object" && key1 !== null) {
          if(Array.isArray(key1)&&Array.isArray(key2))
            return true;
          else
            return objectsAreSameType(key1,key2);
        }
        return true;
      }
      return false;
    }
    return true;
  });
  return !results.includes(false);
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
  ["Discord Public Test Beta", new URL("https://ptb.discord.com/app"),       true ],
  ["Fosscord",                 new URL("https://dev.fosscord.com/app"),     false ],
  ["Fosscord Staging",         new URL("https://staging.fosscord.com/app"),  true ],
  ["Freecord",                 new URL("https://app.freecord.ir/app"),       true ],
] as const);

/**
 * An object which type includes information about the WebCord's build
 * configuration and metadata.
 */
export interface buildInfo {
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

export function isPartialBuildInfo(object: unknown): object is Partial<buildInfo> {
  // #1 Element is object.
  if (!(object instanceof Object))
    return false;
  // #2 'type' property contains 'release' and 'devel' strings if defined.
  if("type" in object)
    switch ((object as buildInfo).type) {
      case "release":
      case "devel":
        break;
      case undefined:
        break;
      default:
        return false;
    }
  // #3 If object contains 'commit' property, it should be of type 'string'.
  if ("commit" in object && !(typeof (object as buildInfo).commit === "string"))
    return false;

  /** List of valid properties for the `.features` object. */
  const features = ["updateNotifications"];
  // #4 If object contains the 'features' property, it should be an object.
  if ("features" in object)
    if (!((object as buildInfo).features instanceof Object))
      return false;
    else for(const property of features)
    // #5 `features` properties are of type `boolean`.
      if(Object.prototype.hasOwnProperty.call((object as {features:Record<string, unknown>}).features, property))
        if(typeof (object as {features:Record<string,unknown>}).features[property] !== "boolean")
          return false;

  // #6 On Windows, AppUserModelID should be of 'string' type
  if (process.platform === "win32" && !(typeof (object as buildInfo).AppUserModelId === "string"))
    return false;
  return true;
}

export type SessionLatest = Electron.Session & {
  /**
	 * A method that is unsupported within your Electron version, but valid
	 * for Electron releases supporting WebHID API, which are versions from
	 * range `>=14.1.0 && <15.0.0 || >=15.1.0`.
	 */
  setDevicePermissionHandler: (handler: (()=>boolean)|null)=>void;
};

export type ElectronLatest = typeof import("electron/main") & {
  /** An API that is unsupported on current Electron version. */
  safeStorage: {
    decryptString: (encrypted:Buffer)=>string;
    encryptString: (plainText:string)=>Buffer;
    isEncryptionAvailable: () => boolean;
  };
};

/**
 * A sanitizer configuration that allows only for tags that modifies the code
 * formatting.
 */
export const sanitizeConfig = {
  /** Allow tags that modifies text style and/or has a semantic meaning. */
  ALLOWED_TAGS: ["b", "i", "u", "s", "em", "kbd", "strong", "code", "small", "br"],
  /** Block every attribute */
  ALLOWED_ATTR: []
};

/**
 * Like {@link Partial<T>}, except it also makes all subproperties in T
 * optional.
 */
export type PartialRecursive<T> = {
  [P in keyof T]?: PartialRecursive<T[P]>
};