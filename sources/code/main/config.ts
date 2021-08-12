import * as fs from "fs";
import * as deepmerge from "deepmerge";
import { app, BrowserWindow, screen } from "electron";
import { resolve } from "path"
import { appInfo } from "./properties";
import * as _ from "lodash";
//import { TranslatedStrings } from "./lang"

 function isJsonSyntaxCorrect(string: string) {
	try {
		JSON.parse(string);
	} catch {
		return false;
	}
	return true;
}

/**
 * An class which initializes and modifies of the main application configuration.
 * 
 * @todo Implement translated strings for TypeErrors.
 * @todo Use JSONC format instead, so every option will have its describtion in the comments.
 */

export class AppConfig {
    /** A configuration template that is used for generating the config with the default values. */
    private defaultConfig = {
        hideMenuBar: false,
        mobileMode: false,
        disableTray: false,
        devel: false,
        csp: {
            disabled: false,
            thirdparty: {
                spotify: false,
                gif: false,
                hcaptcha: false,
                youtube: false,
                twitter: false,
                twitch: false,
                streamable: false,
                vimeo: false,
                soundcloud: false,
                paypal: false,
                audius: false,
                algolia: false,
            }
        }
    };
    private path: fs.PathLike = resolve(app.getPath('userData'), 'config.json');
    private spaces: number;
    private write(object: AppConfig["defaultConfig"]) {
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

    public set(object: Partial<AppConfig["defaultConfig"]>): void {
        const oldObject = JSON.parse(fs.readFileSync(this.path).toString());
        const newObject = deepmerge(oldObject, object);
        this.write(newObject);
    }
    /**
     * Gets the value from the configuration file of one of it's `keys`.
     * Implemented for compatibility with old WebCord's settings GUI.
     * 
     * @param key A string representing one of the configuration keys in dot notation.
     * @returns An value of the `unkown` type from the picked  `key`.
     * 
     * @example
     * // Initializes the config methods / properties.
     * const conf = new AppConfig();
     * // Logs true or false
     * console.log(conf.getProperty('csp.disabled'))
     * // Cases the TypeError due to missing property
     * console.log(conf.getProperty('dev.random'))
     * 
     * @deprecated Use `AppConfig.get()[key]` instead.
     */
    public getProperty(key: string): unknown {
        const object = this.get();
        return key
            .split('.')
            .reduce((partObject: unknown, property) => {
                if (property in (partObject as Record<string, unknown>))
                    return (partObject as Record<string, unknown>)[property];
                else
                    return undefined
            }, object);
    }
    /** Checks if there's a property (in dot notation) set in config.
     * 
     * @deprecated
     * - Class type strictly defines which properties exists or does not exist.
     * - In the future, a TypeGuard will be made as a class method to check if
     * JSON config type is correct when running the application and overwrite it
     * if it is not.
     */
    public hasProperty(key: string): boolean {
        return (this.getProperty(key) !== undefined)
    }
    /** 
     * Overwrites single key with the value.
     * Made for compatibility reasons with old WebCord's settings GUI.
     * 
     * @deprecated Use `AppConfig.set()` instead.
     */
    public setProperty(key: string, value: boolean): void {
        const object = this.get();
        /* 
         * In the future I will remove the dependency on lodash.
         */
        _.set(object, key, value);
        this.write(object);
    }
    /** Returns the entire parsed configuration file in form of the JavaScript object. */
    public get(): AppConfig["defaultConfig"] {
        const parsedConfig = JSON.parse(fs.readFileSync(this.path).toString());
        return parsedConfig;
    }
    /**
     * Initializes the main application configuration and provides the way of controling it,
     * using `get`, `set` and `getProperty` public methods.
     * 
     * @param path A path to application's configuration. Defaults to `App.getPath('userdata')+"/config.json"`
     * @param spaces A number of spaces that will be used for indentation of the configuration file.
     */
    constructor(path?: fs.PathLike, spaces?: number) {
        if(path !== undefined)
            this.path = path;
        if (spaces !== undefined && spaces > 0)
            this.spaces = spaces;
        else
            this.spaces = 4;
        if(!isJsonSyntaxCorrect)
            fs.rmSync(this.path)
        if (!fs.existsSync(this.path))
            this.write(this.defaultConfig);
        else
            this.write(deepmerge(this.defaultConfig, this.get()))
    }
}

type windowStatus = {
    width: number;
    height: number;
    isMaximized: boolean;
}

export class WinStateKeeper {

    // Private properties

    private defaultConfig: Record<string, windowStatus>;
    private file: fs.PathLike = resolve(app.getPath('userData'),'windowState.json')
    private spaces: number;
    private windowName: string;

    /**
     * An object containing width and height of the window watched by `WinStateKeeper`
     */

    public initState: Readonly<windowStatus>;

    // Private methods:

    private write(object: WinStateKeeper["defaultConfig"]) {
        fs.writeFileSync(this.file, JSON.stringify(object, null, this.spaces));
    }
    private set(object: Partial<WinStateKeeper["defaultConfig"]>): void {
        const oldObject = JSON.parse(fs.readFileSync(this.file).toString());
        const newObject = deepmerge(oldObject, object);
        this.write(newObject);
    }
    private get(): WinStateKeeper["defaultConfig"] {
        const parsedConfig = JSON.parse(fs.readFileSync(this.file).toString());
        return parsedConfig;
    }
    private setState(window: BrowserWindow) { 
        if(window.isMaximized()) {
            this.set({
                [this.windowName]: {
                    width: this.get()[this.windowName].width,
                    height: this.get()[this.windowName].height,
                    isMaximized: true
                }
            })
        } else {
            this.set({
                [this.windowName]: {
                    width: window.getNormalBounds().width,
                    height: window.getNormalBounds().height,
                    isMaximized: false
                }
            });
            console.log(window.getNormalBounds().width, window.isMaximized())
        }
    }

    /**
     * Initializes the EventListeners, usually **after** `window` is definied.
     * 
     * @param window A `BrowserWindow` from which current window bounds are picked.
     */

    public watchState(window: BrowserWindow):void {
        window.on('resize', () => { this.setState(window) });
        window.on('unmaximize', () => { this.setState(window) });
        window.on('maximize', () => { this.setState(window) });
    }

    /**
     * Reads the data from the current configuration
     * 
     * @param windowName Name of the group in which other properties should be saved.
     * @param file Path to application's configuration. Defaults to `app.getPath('userData')+/windowState.json`
     * @param spaces Number of spaces that will be used for indentation of the configuration file.
     */
    constructor(windowName: string, file?: fs.PathLike, spaces?: number) {

        // Initialize class
        this.windowName = windowName;
        this.defaultConfig = {
            [this.windowName]: {
                width: appInfo.minWinWidth + (screen.getPrimaryDisplay().workAreaSize.width / 3),
                height: appInfo.minWinHeight + (screen.getPrimaryDisplay().workAreaSize.height / 3),
                isMaximized: false
            }
        }
        if (file !== undefined)
            this.file = file;
        if (spaces !== undefined && spaces > 0)
            this.spaces = spaces;
        else
            this.spaces = 4; 

        if (!fs.existsSync(this.file) || this.get().win !== undefined)
            this.write(this.defaultConfig);

        this.initState = {
            width: this.get()[this.windowName].width,
            height: this.get()[this.windowName].height,
            isMaximized: this.get()[this.windowName].isMaximized
        }
    }
}