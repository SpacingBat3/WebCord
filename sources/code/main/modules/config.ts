/**
 * configManager
 */

import { readFileSync, existsSync, rmSync, writeFileSync } from "fs";
import {
  app,
  BrowserWindow,
  screen,
  safeStorage
} from "electron/main";
import { resolve } from "path";
import { appInfo } from "../../common/modules/client";
import { typeMerge, PartialRecursive } from "../../common/global";

type reservedKeys = "radio"|"dropdown"|"input"|"type"|"keybind";

type lastKeyof<T> = T extends object ? T[keyof T] extends object ? lastKeyof<T[keyof T]> : keyof T : never;

type checkListKeys = Exclude<lastKeyof<typeof defaultAppConfig.settings>, reservedKeys>;

export type checkListRecord = Partial<Record<checkListKeys,boolean|null>>;

export type configElement = checkListRecord | {
  radio: number;
} | {
  dropdown: number;
} | {
  input: string|number;
} | {
  keybind: string;
};

interface AppConfigBase {
  settings: Record<string, Record<string, configElement>>;
  update: Record<string, unknown>;
}

export type cspTP<T> = {
  [P in keyof typeof defaultAppConfig["settings"]["advanced"]["cspThirdParty"]]: T
};

const canImmediatellyEncrypt = safeStorage.isEncryptionAvailable();

function isReadyToEncrypt() {
  if(process.platform === "darwin")
    return true;
  else
    return app.isReady();
}

const defaultAppConfig = Object.freeze({
  settings: {
    general: {
      menuBar: {
        hide: false
      },
      tray: {
        disable: false
      },
      taskbar: {
        flash: true
      },
      window: {
        transparent: false,
        hideOnClose: true
      }
    },
    privacy: {
      blockApi: {
        science: true,
        typingIndicator: false,
        fingerprinting: true
      },
      permissions: {
        "video": null as boolean|null,
        "audio": null as boolean|null,
        "fullscreen": true,
        "notifications": null as boolean|null,
        "display-capture": true,
        "background-sync": false,
      },
    },
    advanced: {
      csp: {
        enabled: true
      },
      cspThirdParty: {
        spotify: true,
        gif: true,
        hcaptcha: true,
        youtube: true,
        twitter: true,
        twitch: true,
        streamable: true,
        vimeo: true,
        soundcloud: true,
        paypal: true,
        audius: true,
        algolia: true,
        reddit: true,
        googleStorageApi: true
      },
      currentInstance: {
        radio: 0 as 0|1
      },
      devel: {
        enabled: false
      },
      redirection: {
        warn: true
      },
      optimize: {
        gpu: false
      },
      webApi: {
        webGl: true
      },
      unix: {
        autoscroll: false
      }
    }
  },
  update: {
    notification: {
      version: "",
      till: "",
    },
  },
  screenShareStore: {
    audio: false
  }
});

export type AppConfig = typeof defaultAppConfig;

const enum FileExt {
  JSON = ".json",
  Encrypted = ""
}

class Config<T> {
  readonly #pathExtension: FileExt;
  readonly #path;
  #cache: T|null = null;
  /** Default configuration values. */
  private readonly defaultConfig;
  protected spaces = 4;
  #write(object: unknown) {
    const decodedData = JSON.stringify(object, null, this.spaces);
    let encodedData:string|Buffer = decodedData;
    if(this.#pathExtension === FileExt.Encrypted)
      encodedData = safeStorage.encryptString(decodedData);
    writeFileSync(this.#path+this.#pathExtension,encodedData);
  }
  #read(): unknown {
    const encodedData = readFileSync(this.#path+this.#pathExtension);
    let decodedData = encodedData.toString();
    try {
      if(this.#pathExtension === FileExt.Encrypted)
        decodedData = safeStorage.decryptString(encodedData);
      return JSON.parse(decodedData);
    } catch(err) {
      console.debug("[Config] Error in #read during config decoding.");
      console.debug(err);
    }
    return {};
  }
  /**
   * Merges the configuration object with the another `object`.
   *
   * To do this, both old and new values are deeply merged,
   * where new values can overwite the old ones.
   *
   * @param object A JavaScript object that will be merged with the configuration object.
   */

  public set value(object: PartialRecursive<T>) {
    const value = typeMerge(this.value, {nullType: Boolean}, object);
    this.#write(value);
    this.#cache = value;
  }
  /** Returns the entire parsed configuration file in form of the JavaScript object. */
  public get value(): Readonly<T> {
    if(this.#cache !== null)
      return this.#cache;
    const value = typeMerge(this.defaultConfig, {nullType: Boolean}, this.#read());
    this.#cache = value;
    return Object.freeze(value);
  }
  constructor(path:string, encrypted: boolean, defaultConfig: T, spaces?: number) {
    if(encrypted && !isReadyToEncrypt())
      throw new Error("Cannot use encrypted configuration file when app is not ready yet!");
    // Set required properties of this config file.
    this.#path = path;
    this.#pathExtension = encrypted && safeStorage.isEncryptionAvailable() ?
      FileExt.Encrypted :
      FileExt.JSON;
    this.defaultConfig = Object.freeze(defaultConfig);
    // Replace "spaces" if it is definied in the constructor.
    if (spaces !== undefined && spaces > 0)
      this.spaces = spaces;
    // Restore or remove configuration.
    switch(this.#pathExtension) {
      case FileExt.Encrypted:
        if(!existsSync(this.#path+FileExt.Encrypted) && existsSync(this.#path+FileExt.JSON))
          this.#write(readFileSync(this.#path+FileExt.JSON));
        if(existsSync(this.#path+FileExt.JSON))
          rmSync(this.#path+FileExt.JSON);
        break;
      case FileExt.JSON:
        if(existsSync(this.#path+FileExt.Encrypted))
          rmSync(this.#path+FileExt.Encrypted);
        break;
    }
    // Fix configuration file.
    let config;
    if (!(existsSync(this.#path+this.#pathExtension)))
      config = this.defaultConfig;
    else
      config = {...this.defaultConfig, ...this.value};
    try {
      this.#write(config);
      this.#cache = config;
    } catch {
      this.#write(this.defaultConfig);
      this.#cache = this.defaultConfig;
    }
  }
}

export const appConfig = new Config(
  resolve(app.getPath("userData"), "config"),
  canImmediatellyEncrypt,
  defaultAppConfig satisfies AppConfigBase
);

interface WindowStatus {
  width: number;
  height: number;
  isMaximized: boolean;
}

export class WinStateKeeper<T extends string> extends Config<Partial<Record<T, WindowStatus>>> {
  #windowName: T;
  #tempstate: typeof this.value;
  /**
   * An object containing width and height of the window watched by `WinStateKeeper`
   */
  public initState: Readonly<WindowStatus>;
  #setState(window: BrowserWindow, eventType = "resize") {
    switch(eventType) {
      case "maximize":
      case "unmaximize":
        this.#tempstate = Object.freeze({
          [this.#windowName satisfies T]: Object.freeze({
            width: this.#tempstate[this.#windowName]?.width ?? this.value[this.#windowName]?.width ?? window.getNormalBounds().width,
            height: this.#tempstate[this.#windowName]?.height ?? this.value[this.#windowName]?.height ?? window.getNormalBounds().height,
            isMaximized: eventType === "maximize"
          } satisfies WindowStatus)
        } as unknown as Record<T, Readonly<WindowStatus>>);
        break;
      default:
        if(window.isMaximized()) return;
        this.#tempstate = Object.freeze({
          [this.#windowName satisfies T]: Object.freeze({
            width: window.getNormalBounds().width,
            height: window.getNormalBounds().height,
            isMaximized: this.#tempstate[this.#windowName]?.isMaximized ?? this.value[this.#windowName]?.isMaximized ?? false
          } satisfies WindowStatus)
        } as unknown as Record<T, Readonly<WindowStatus>>);
    }
    console.debug(`[WIN] Electron event: ${eventType}`);
    console.debug(`[WIN] State changed to: ${JSON.stringify(this.#tempstate[this.#windowName])}`);
  }

  /**
   * Initializes the EventListeners, usually **after** `window` is defined.
   *
   * @param window A `BrowserWindow` from which current window bounds are picked.
   */

  public watchState(window: BrowserWindow):void {
    window.on("resize", () => setTimeout(()=>this.#setState(window),10));
    window.on("unmaximize", () => this.#setState(window, "unmaximize"));
    window.on("maximize", () => this.#setState(window, "maximize"));
    window.once("closed", () => this.value = this.#tempstate);
  }

  /**
   * Reads the data from the current configuration
   *
   * @param windowName Name of the group in which other properties should be saved.
   * @param path Path to application's configuration. Defaults to `app.getPath('userData')+/windowState.json`
   * @param spaces Number of spaces that will be used for indentation of the configuration file.
   */
  constructor(windowName: T, path = resolve(app.getPath("userData"),"windowState"), spaces?: number) {
    const defaults = Object.freeze({
      width: appInfo.minWinWidth + (screen.getPrimaryDisplay().workAreaSize.width / 3),
      height: appInfo.minWinHeight + (screen.getPrimaryDisplay().workAreaSize.height / 3),
      isMaximized: false
    } satisfies WindowStatus);
    // Initialize class
    super(path, true, Object.freeze({
      [windowName]: defaults
    }) as Partial<Record<T, WindowStatus>>, spaces);

    this.#windowName = windowName;
    this.initState = Object.freeze({
      width: this.value[this.#windowName]?.width ?? defaults.width,
      height: this.value[this.#windowName]?.height ?? defaults.height,
      isMaximized: this.value[this.#windowName]?.isMaximized ?? false
    });
    this.#tempstate = this.value;
  }
}

void import("electron/main")
  .then(electron => electron.ipcMain)
  .then(ipc => ipc.on("settings-config-modified",
    (event, config:AppConfig) => {
      // Only permit the local pages.
      if(new URL(event.senderFrame.url).protocol === "file:")
        appConfig.value = config;
    })
  );