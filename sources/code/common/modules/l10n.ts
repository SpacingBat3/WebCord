/* l10nSupport – app localization implementation */
import * as path from "path";
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
  private loadFile<T extends keyof typeof defaultTranslations>(type: T): typeof defaultTranslations[T] {
    /**
		 * Computed strings (mixed localized and fallback object)
		 */
    let finalStrings: typeof defaultTranslations[T] | unknown = defaultTranslations[type];
    /**
		 * Translated strings in the native user language.
		 * 
		 * @todo
		 * Make `localStrings` not overwrite `l10nStrings`
		 * when it is of wrong type.
		 */
    let localStrings: unknown;

    let internalStringsFile = path.resolve(getAppPath(), "sources/translations/" + getLocale() + "/" + type.toString())+".json";
    const externalStringsFile = path.resolve(path.dirname(getAppPath()), "translations/" + getLocale() + "/" + type.toString())+".json";
    /* Handle unofficial translations */

    if (!existsSync(internalStringsFile))
      internalStringsFile = externalStringsFile;

    if (process.type === "browser" && process.platform === "win32" && !app.isReady()) console.warn(
      "[WARN] Electron may fail loading localized strings,\n" +
			"       because the app hasn't still emitted the 'ready' event!\n" +
			"[WARN] In this case, English strings will be used as a fallback.\n"
    );
    if (existsSync(internalStringsFile)) {
      localStrings = JSON.parse(readFileSync(internalStringsFile).toString());
      finalStrings = deepmerge(defaultTranslations[type], localStrings);
    }
    if (objectsAreSameType(finalStrings, defaultTranslations[type])) {
      return finalStrings;
    } else {
      langDialog.emit("show-error", internalStringsFile);
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