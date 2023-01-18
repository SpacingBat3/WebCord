/*
 * base.ts — module containing base functions, type structures etc.
 */

import type { Config } from "dompurify";

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
export const enum DiscordFavicon {
  Default = "528c5d45bc69bbbcd0abebc5ac867cd164a35ad2",
  Unread = "ea6dd5012654b5260934bc7f481dc94a63ea4ae3",
  UnreadAlt = "c92b9034cc8456525cc7cd6bedba10056512a1d3"
}

/**
 * List of Vendor IDs of common GPU manufacturers. This is usually represented
 * as a hexadecimal number, so it should be also listed here as such.
 */
export const enum GPUVendors {
  AMD = 0x1002,
  NVIDIA = 0x10DE,
  Intel = 0x8086
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
  ["Freecord",                 new URL("https://app.freecord.ir/app"),       true ]
] as const) satisfies readonly (readonly [ name: string, url: URL, active: boolean ])[];

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
 * 1. `Array`s aren't merged at all.
 * 2. Only primitive `Object` can be deeply merged.
 * 3. Other values are assigned by type.
 * 
 * **Note:** Values of same type are expected to have the same constructors.
 * 
 * @param source Object used as a type source.
 * @param objects Objects to merge (at least one). 
 * @returns Merged object.
 * 
 * @todo More acurate types (e.g. literals to primitives)
 */
export function typeMerge<T extends object>(source: T, config: TypeMergeConfig, ...objects:unknown[]&[unknown]) {
  const typeOf = (o1:unknown,c:unknown) => (o1?.constructor ?? o1) === c;
  function getObjectKeys<T extends object,U>(source:T,...objects:U[]) {
    objects = objects.filter(object => object instanceof Object)
    if(objects.length === 0)
      return [];
    return objects
      .map(object => Object.keys(object as object))
      .reduce(
        (pre,cur) => [...pre,...cur.filter(key => source.hasOwnProperty(key))]
      ) as (keyof T & keyof U)[]
  }
  function deepMerge<T,U>(source:T,object:U) {
    const result = {...source};
    if(!(source instanceof Object) || !(object instanceof Object))
      return source;
    (getObjectKeys(source,object)
      .filter(
        key => (typeOf(object[key],source[key]?.constructor) || (
          config.nullType !== undefined ?
            source[key] === null && object[key]?.constructor === config.nullType :
            false
        )) && !Array.isArray(source)
      ) as (keyof T & keyof U)[])
      .map(key => {
        if(typeOf(source[key],Object))
          result[key] = deepMerge(source[key], object[key]);
        else
          result[key] = object[key] as T[typeof key];
      });
    return result;
  }
  return (objects as T[])
    .reduce((prev, cur:unknown) => deepMerge(prev, cur), source);
}