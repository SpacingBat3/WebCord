/**
 * configManager
 */

import * as fs from "fs";
import {
  app,
  BrowserWindow,
  screen,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
  // @ts-ignore
  safeStorage as SafeStorage
} from "electron/main";
import { resolve } from "path";
import { appInfo } from "../../common/modules/client";
import { ElectronLatest, objectsAreSameType, PartialRecursive } from "../../common/global";
import { deepmerge } from "deepmerge-ts";
import { gte, major } from "semver";


const safeStorage:ElectronLatest["safeStorage"]|undefined = SafeStorage as unknown as ElectronLatest["safeStorage"]|undefined;

type reservedKeys = "radio"|"dropdown"|"input"|"type"|"keybind";

type lastKeyof<T> = T extends object ? T[keyof T] extends object ? lastKeyof<T[keyof T]> : keyof T : never;

type checkListKeys = Exclude<lastKeyof<typeof defaultAppConfig.settings>, reservedKeys>;

export type checkListRecord = Partial<Record<checkListKeys,boolean|null>>;

export type ConfigElement = checkListRecord | {
  radio: number;
} | {
  dropdown: number;
} | {
  input: string|number;
} | {
  keybind: string;
};

interface AppConfigBase {
  settings: Record<string, Record<string, ConfigElement>>;
  update: Record<string, unknown>;
}

export type cspTP<T> = {
  [P in keyof typeof defaultAppConfig["settings"]["advanced"]["cspThirdParty"]]: T
};

const canImmediatellyEncrypt = safeStorage?.isEncryptionAvailable()??false;

function isReadyToEncrypt() {
  if(process.platform === "darwin")
    return true;
  else
    return app.isReady();
}

const defaultAppConfig = {
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
};

const fileExt = Object.freeze({
  json: ".json",
  encrypted: ""
});

class Config<T> {
  readonly #pathExtension: (typeof fileExt)["encrypted"|"json"];
  readonly #path;
  /** Default configuration values. */
  private readonly defaultConfig;
  protected spaces = 4;
  private write(object: unknown) {
    const decodedData = JSON.stringify(object, null, this.spaces);
    let encodedData:string|Buffer = decodedData;
    if(this.#pathExtension === fileExt.encrypted)
      encodedData = safeStorage?.encryptString(decodedData)??decodedData;
    fs.writeFileSync(this.#path+this.#pathExtension,encodedData);
  }
  private read(): unknown {
    const encodedData = fs.readFileSync(this.#path+this.#pathExtension);
    let decodedData = encodedData.toString();
    if(this.#pathExtension === fileExt.encrypted)
      decodedData = safeStorage?.decryptString(encodedData)??encodedData.toString();
    return JSON.parse(decodedData);
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
    const oldObject = this.value;
    const newObject:unknown = deepmerge(oldObject, object);
    if(objectsAreSameType(newObject, oldObject))
      this.write(newObject);
    else
      console.debug(newObject);
  }
  /** Returns the entire parsed configuration file in form of the JavaScript object. */
  public get value(): T {
    const parsedConfig:unknown = this.read();
    const mergedConfig:unknown = deepmerge(this.defaultConfig, parsedConfig);
    if(objectsAreSameType(mergedConfig, this.defaultConfig))
      return Object.freeze(mergedConfig);
    else
      return this.defaultConfig;
  }
  constructor(path:string, encrypted: boolean, defaultConfig: T, spaces?: number) {
    if(encrypted && !isReadyToEncrypt())
      throw new Error("Cannot use encrypted configuration file when app is not ready yet!");
    // Set required properties of this config file.
    this.#path = path;
    this.#pathExtension = encrypted && (safeStorage?.isEncryptionAvailable() === true) ?
      fileExt.encrypted :
      fileExt.json;
    this.defaultConfig = Object.freeze(defaultConfig);
    // Replace "spaces" if it is definied in the constructor.
    if (spaces !== undefined && spaces > 0)
      this.spaces = spaces;
    // Restore or remove configuration.
    switch(this.#pathExtension) {
      case fileExt.encrypted:
        if(!fs.existsSync(this.#path+fileExt.encrypted) && fs.existsSync(this.#path+fileExt.json))
          this.write(fs.readFileSync(this.#path+fileExt.json));
        if(fs.existsSync(this.#path+fileExt.json))
          fs.rmSync(this.#path+fileExt.json);
        break;
      case fileExt.json:
        if(fs.existsSync(this.#path+fileExt.encrypted))
          fs.rmSync(this.#path+fileExt.encrypted);
        break;
    }
    // Fix configuration file.
    if (!(fs.existsSync(this.#path+this.#pathExtension)))
      this.write(this.defaultConfig);
    else {
      try {
        this.write({...this.defaultConfig, ...this.value});
      } catch {
        this.write(this.defaultConfig);
      }
    }
  }
}

// === MAIN APP CONFIGURATION CLASS ===

/**
 * Class that initializes and modifies of the main application configuration.
 */
export class AppConfig extends Config<typeof defaultAppConfig extends AppConfigBase ? typeof defaultAppConfig : never> {
  /**
   * Initializes the main application configuration and provides the way of controling it,
   * using `get`, `set` and `getProperty` public methods.
   * 
   * @param path A path to application's configuration. Defaults to `App.getPath('userdata')+"/config.*"`
   * @param spaces A number of spaces that will be used for indentation of the configuration file.
   */
  constructor(path = resolve(app.getPath("userData"), "config"), spaces?: number) {
    super(path,canImmediatellyEncrypt,defaultAppConfig,spaces);
  }
}

// === WINDOW STATE KEEPER CLASS ===

/**
 * Whenever to apply a workaround for "maximize" and "unmaximize" events.
 * 
 * This allows WebCord to work on very old and deprecated Electron releases.
 */
const workaroundLinuxMinMaxEvents = (() => {
  if(process.platform !== "linux")
    return false;
  const {electron} = process.versions;
  if(major(electron) <= 12 || major(electron) > 17)
    return false;
  switch(major(electron)) {
    case 14:
      return gte(electron, "14.2.5");
    case 15:
      return gte(electron, "15.3.6");
    case 16:
      return gte(electron, "16.0.8");
    default:
      return false;
  }
})();

interface windowStatus {
  width: number;
  height: number;
  isMaximized: boolean;
}

export class WinStateKeeper extends Config<Partial<Record<string, windowStatus>>> {
  private windowName: string;
  /**
   * An object containing width and height of the window watched by `WinStateKeeper`
   */
  public initState: Readonly<windowStatus>;
  private setState(window: BrowserWindow, eventType?: string) {
    let event = eventType;
    // Workaround: fix `*maximize` events being detected as `resize`:
    if(workaroundLinuxMinMaxEvents)
      if(eventType === "resize" && window.isMaximized())
        event = "maximize";
      else if (eventType === "resize" && (this.value[this.windowName]?.isMaximized??false))
        event = "unmaximize";
    switch(event) {
      case "maximize":
      case "unmaximize":
        this.value = {
          [this.windowName]: {
            width: this.value[this.windowName]?.width ?? window.getNormalBounds().width,
            height: this.value[this.windowName]?.height ?? window.getNormalBounds().height,
            isMaximized: window.isMaximized()
          }
        };
        break;
      default:
        this.value = {
          [this.windowName]: {
            width: window.getNormalBounds().width,
            height: window.getNormalBounds().height,
            isMaximized: window.isMaximized()
          }
        };
    }
    console.debug("[WIN] State changed to: "+JSON.stringify(this.value[this.windowName]));
    console.debug("[WIN] Electron event: "+(eventType??"not definied"));
    if(workaroundLinuxMinMaxEvents && event !== eventType)
      console.debug("[WIN] Actual event calculated by WebCord: "+(event??"unknown"));
  }

  /**
   * Initializes the EventListeners, usually **after** `window` is definied.
   * 
   * @param window A `BrowserWindow` from which current window bounds are picked.
   */

  public watchState(window: BrowserWindow):void {
    // Timeout is needed to give some time for resize to end on Linux:
    window.on("resize", () => setTimeout(()=>this.setState(window, "resize"),100));
    if(!workaroundLinuxMinMaxEvents){
      window.on("unmaximize", () => this.setState(window, "unmaximize"));
      window.on("maximize", () => this.setState(window, "maximize"));
    }
  }

  /**
   * Reads the data from the current configuration
   * 
   * @param windowName Name of the group in which other properties should be saved.
   * @param path Path to application's configuration. Defaults to `app.getPath('userData')+/windowState.json`
   * @param spaces Number of spaces that will be used for indentation of the configuration file.
   */
  constructor(windowName: string, path = resolve(app.getPath("userData"),"windowState"), spaces?: number) {
    const defaults = {
      width: appInfo.minWinWidth + (screen.getPrimaryDisplay().workAreaSize.width / 3),
      height: appInfo.minWinHeight + (screen.getPrimaryDisplay().workAreaSize.height / 3),
    };
    const defaultConfig = {
      [windowName]: {
        width: defaults.width,
        height: defaults.height,
        isMaximized: false
      }
    };
    // Initialize class
    super(path,true,defaultConfig,spaces);
    this.windowName = windowName;
    this.initState = {
      width: this.value[this.windowName]?.width ?? defaults.width,
      height: this.value[this.windowName]?.height ?? defaults.height,
      isMaximized: this.value[this.windowName]?.isMaximized ?? false
    };
  }
}

void import("electron/main")
  .then(Electron => Electron.ipcMain)
  .then(ipc => ipc.on("settings-config-modified",
    (event, config:AppConfig["defaultConfig"]) => {
      // Only permit the local pages.
      if(new URL(event.senderFrame.url).protocol === "file:")
        new AppConfig().value = config;
    })
  );