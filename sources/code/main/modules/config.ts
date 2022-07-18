/**
 * configManager
 */

import * as fs from "fs";
import { app, BrowserWindow, screen } from "electron/main";
import { resolve } from "path";
import { appInfo } from "../../common/modules/client";
import { objectsAreSameType, isJsonSyntaxCorrect } from "../../common/global";
import { deepmerge } from "deepmerge-ts";

type reservedKeys = "radio"|"dropdown"|"input"|"type"|"keybind"

type lastKeyof<T> = T extends object ? T[keyof T] extends object ? lastKeyof<T[keyof T]> : keyof T : never

type checkListKeys = Exclude<lastKeyof<typeof defaultAppConfig.settings>, reservedKeys>

export type ConfigElement = Partial<Record<checkListKeys,boolean>> | {
  radio: number
} | {
  dropdown: number
} | {
  input: string|number
} | {
  keybind: string
}

const test = {} as unknown as ConfigElement;

if("radio" in test)
  test.radio;

export interface AppConfigBase {
  settings: Record<string, Record<string, ConfigElement>>,
  update: Record<string, unknown>
}

export type cspTP<T> = {
  [P in keyof typeof defaultAppConfig["settings"]["advanced"]["cspThirdParty"]]: T
 }

const defaultAppConfig = {
  settings: {
    general: {
      menuBar: {
        hide: false
      },
      tray: {
        disable: false
      }
    },
    privacy: {
      blockApi: {
        science: true,
        typingIndicator: false,
        fingerprinting: true
      },
      permissions: {
        "video": false,
        "audio": false,
        "fullscreen": true,
        "notifications": false,
        "display-capture": true
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

class Config<T> {
  /** Default configuration values. */
  protected defaultConfig!: T;
  protected path!: fs.PathLike;
  protected spaces = 4;
  protected write(object: typeof this.defaultConfig) {
    fs.writeFileSync(this.path, JSON.stringify(object, null, this.spaces));
  }
  /** 
   * Merges the configuration object with the another `object`.
   * 
   * To do this, both old and new values are deeply merged,
   * where new values can overwite the old ones.
   * 
   * @param object A JavaScript object that will be merged with the configuration object.
   */

  public set(object: Partial<typeof this.defaultConfig>): void {
    const oldObject = this.get();
    const newObject = deepmerge(oldObject, object);
    if(objectsAreSameType(newObject, oldObject)) this.write(newObject);
  }
  /** Returns the entire parsed configuration file in form of the JavaScript object. */
  public get(): typeof this.defaultConfig {
    const parsedConfig:unknown = JSON.parse(fs.readFileSync(this.path).toString());
    const mergedConfig:unknown = deepmerge(this.defaultConfig, parsedConfig);
    if(objectsAreSameType(mergedConfig, this.defaultConfig))
      return mergedConfig;
    else
      return this.defaultConfig;
  }
  constructor(path?: fs.PathLike, spaces?: number) {
    // Replace "path" if it is definied in the constructor.
    if(path !== undefined)
      this.path = path;
    // Replace "spaces" if it is definied in the constructor
    if (spaces !== undefined && spaces > 0)
      this.spaces = spaces;
  }
}
/**
 * An class which initializes and modifies of the main application configuration.
 *
 * @todo Use JSONC format instead, so every option will have its description in the comments.
 */
export class AppConfig extends Config<typeof defaultAppConfig extends AppConfigBase ? typeof defaultAppConfig : never> {
  protected override defaultConfig = defaultAppConfig;
  protected override path: fs.PathLike = resolve(app.getPath("userData"), "config.json");
  /**
   * Initializes the main application configuration and provides the way of controling it,
   * using `get`, `set` and `getProperty` public methods.
   * 
   * @param path A path to application's configuration. Defaults to `App.getPath('userdata')+"/config.json"`
   * @param spaces A number of spaces that will be used for indentation of the configuration file.
   */
  constructor(path?: fs.PathLike, spaces?: number) {
    super(path,spaces);
    // If config file does not exists, create it.
    if (!fs.existsSync(this.path))
      this.write(this.defaultConfig);
    else {
      // If config is not a valid JSON file, remove it.
      if(!isJsonSyntaxCorrect(fs.readFileSync(this.path).toString()))
        fs.rmSync(this.path);
      this.write({...this.defaultConfig, ...this.get()});
    }
  }
}

type windowStatus = {
    width: number;
    height: number;
    isMaximized: boolean;
}

export class WinStateKeeper extends Config<Record<string, windowStatus>> {
  protected override path: fs.PathLike = resolve(app.getPath("userData"),"windowState.json");
  private windowName: string;
  /**
   * An object containing width and height of the window watched by `WinStateKeeper`
   */
  public initState: Readonly<windowStatus>;
  private setState(window: BrowserWindow, eventType?: string) {
    // Workaround: fix `*maximize` events being detected as `resize`:
    let event = eventType;
    if(eventType === "resize" && window.isMaximized())
      event = "maximize";
    else if (eventType === "resize" && this.get()?.[this.windowName]?.isMaximized)
      event = "unmaximize";
    switch(event) {
      case "maximize":
      case "unmaximize":
        this.set({
          [this.windowName]: {
            width: this.get()?.[this.windowName]?.width ?? window.getNormalBounds().width,
            height: this.get()?.[this.windowName]?.height ?? window.getNormalBounds().height,
            isMaximized: window.isMaximized()
          }
        });
        break;
      default:
        this.set({
          [this.windowName]: {
            width: window.getNormalBounds().width,
            height: window.getNormalBounds().height,
            isMaximized: window.isMaximized()
          }
        });
    }
    console.debug("[WIN] State changed to: "+JSON.stringify(this.get()[this.windowName]));
    console.debug("[WIN] Electron event: "+(eventType??"not definied"));
    if(event !== eventType) console.debug("[WIN] Actual event calculated by WebCord: "+(event??"unknown"));
  }

  /**
   * Initializes the EventListeners, usually **after** `window` is definied.
   * 
   * @param window A `BrowserWindow` from which current window bounds are picked.
   */

  public watchState(window: BrowserWindow):void {
    // Timeout is needed to give some time for resize to end on Linux:
    window.on("resize", () => setTimeout(()=>this.setState(window, "resize"),100));
    window.on("unmaximize", () => this.setState(window, "unmaximize"));
    window.on("maximize", () => this.setState(window, "maximize"));
  }

  /**
   * Reads the data from the current configuration
   * 
   * @param windowName Name of the group in which other properties should be saved.
   * @param path Path to application's configuration. Defaults to `app.getPath('userData')+/windowState.json`
   * @param spaces Number of spaces that will be used for indentation of the configuration file.
   */
  constructor(windowName: string, path?: fs.PathLike, spaces?: number) {
    super(path,spaces);
    // Initialize class
    const defaults = {
      width: appInfo.minWinWidth + (screen.getPrimaryDisplay().workAreaSize.width / 3),
      height: appInfo.minWinHeight + (screen.getPrimaryDisplay().workAreaSize.height / 3),
    };
    this.windowName = windowName;
    this.defaultConfig = {
      [this.windowName]: {
        width: defaults.width,
        height: defaults.height,
        isMaximized: false
      }
    };
    if (!fs.existsSync(this.path))
      this.write(this.defaultConfig);
    else {
      // If config is not a valid JSON file, remove it.
      if(!isJsonSyntaxCorrect(fs.readFileSync(this.path).toString()))
        fs.rmSync(this.path);
      this.write({...this.defaultConfig, ...this.get()});
    }
    this.initState = {
      width: this.get()?.[this.windowName]?.width ?? defaults.width,
      height: this.get()?.[this.windowName]?.height ?? defaults.height,
      isMaximized: this.get()?.[this.windowName]?.isMaximized ?? false
    };
  }
}

void import("electron/main")
  .then(Electron => Electron.ipcMain)
  .then(ipc => ipc.on("settings-config-modified",
    (_event, config:AppConfig["defaultConfig"])=> {
      new AppConfig().set(config);
    })
  );