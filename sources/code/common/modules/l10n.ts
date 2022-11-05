/* l10nSupport – app localization implementation */
import { resolve, dirname } from "path";
import { readFileSync, existsSync } from "fs";
import { deepmerge } from "deepmerge-ts";
import { app } from "electron/main";
import { objectsAreSameType } from "../global";
import { EventEmitter } from "events";
import { getAppPath, getLocale, getName, showMessageBox } from "./electron";

// Import fallback translations that will be statically typed.
import * as __clientJSON from "../../../translations/en/client.json";
import * as __webJSON from "../../../translations/en/web.json";
import * as __settingsJSON from "../../../translations/en/settings.json";

const defaultTranslations = {
  client: __clientJSON,
  web: __webJSON,
  settings: __settingsJSON
};

const langDialog = new EventEmitter();

langDialog.once("show-error", (localizedStrings: string) => {
  showMessageBox({
    title: "Error loading translations for locale: '" + getLocale().toLocaleUpperCase() + "'!",
    type: "error",
    message: "An error occured while loading 'strings' from file: '" +
			localizedStrings + "'. " +
			"Please make sure that the file syntax is correct!\n\n" +
			"This will lead to " + getName() + " use English strings instead."
  });
});

/**
 * The class that can be used to get an object containing translated strings and/or English strings
 * if translation is missing or invalid.
 * 
 * Currently, it will load the translations correctly at following conditions:
 * 
 * - if application is `ready`,
 * - when translated strings are of correct type: `Partial<T>`, where `T` is the type of the
 *   fallback strings.
 * 
 * In other situations, an error message will occur and fallback strings will be used instead. 
 */
class l10n {
  /**
   * Parses locale to get a list of associated locale names, ordered by best
   * match. This list also includes the initial property.
   */
  #altLocales<T extends string>(locale:T):string[]&{0:T} {
    const separator = locale.includes("_") ? "_" : locale.includes("-") ? "-" : null;
    if(separator === null) return [
      locale,
      locale.toLowerCase() + "_" + locale.toUpperCase(),
      locale.toLowerCase() + "-" + locale.toUpperCase(),
      locale === locale.toLowerCase() ? locale.toUpperCase() : locale.toLowerCase()
    ];
    return [
      locale,
      separator === "-" ? locale.replace("-","_") : locale.replace("_","-"),
      ...locale.split(separator).filter(value => value !== ""),
      locale.toUpperCase(),
      locale.toLowerCase()
    ];
  }
  /** List of associated locales with the current user's locale. */
  public locales = Object.freeze(this.#altLocales(getLocale()));

  /** A list of paths from which WebCord will load the localization files. */
  public searchPaths = Object.freeze([
    // Internal (inside `app.asar`) localization files paths
    ...this.locales.map(lang => resolve(getAppPath(), "sources/translations", lang)),
    // External (in `resources`) localization files paths
    ...this.locales.map(lang => resolve(dirname(getAppPath()), "translations", lang))
  ]);

  private loadFile<T extends keyof typeof defaultTranslations>(type: T): typeof defaultTranslations[T] {
    /**
		 * Computed strings (mixed localized and fallback object)
		 */
    let finalStrings: typeof defaultTranslations[T] | unknown = defaultTranslations[type];
    const localeFile = this.searchPaths
      .map(dir => resolve(dir, type+".json"))
      .find(file => existsSync(file));

    if (process.type === "browser" && process.platform === "win32" && !app.isReady())
      console.warn([
        "[WARN] Electron may fail loading localized strings,",
        "       because the app hasn't still emitted the 'ready' event!",
        "[WARN] In this case, English strings will be used as a fallback."
      ].join("\n"));

    if (localeFile !== undefined) {
      console.debug("[L10N] Computing strings for locale list: "+this.locales.join(", "));
      finalStrings = deepmerge(defaultTranslations[type], JSON.parse(readFileSync(localeFile).toString()));
    }

    if (objectsAreSameType(finalStrings, defaultTranslations[type])) {
      return finalStrings;
    } else {
      langDialog.emit("show-error", localeFile);
      return defaultTranslations[type];
    }
  }
  public readonly client;
  public readonly web;
  public readonly settings;
  constructor() {
    this.client = this.loadFile("client");
    this.web = this.loadFile("web");
    this.settings = this.loadFile("settings");
  }
}

export default l10n;