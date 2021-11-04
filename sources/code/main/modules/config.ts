/**
 * configManager
 */

import * as fs from "fs";
import { app, BrowserWindow, screen } from "electron";
import { resolve } from "path"
import { appInfo } from "./client";
import { objectsAreSameType } from "../../global";
import { deepmerge } from 'deepmerge-ts';

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
        disableTray: false,
        devel: false,
        redirectionWarning: true,
        csp: {
            enabled: true,
            thirdparty: {
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
                funimation: true
            }
        },
        blockApi: {
            typingIndicator: false,
            science: true,
        },
        permissionsBlocked: ([] as string[])
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
        const oldObject = this.get();
        const newObject = deepmerge(oldObject, object);
        if(objectsAreSameType(newObject, oldObject)) this.write(newObject);
    }
    /** Returns the entire parsed configuration file in form of the JavaScript object. */
    public get(): AppConfig["defaultConfig"] {
        const parsedConfig:unknown = JSON.parse(fs.readFileSync(this.path).toString());
        const mergedConfig:unknown = deepmerge(this.defaultConfig, parsedConfig)
        if(objectsAreSameType(mergedConfig, this.defaultConfig))
            return mergedConfig;
        else
            return this.defaultConfig;
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
        if (!fs.existsSync(this.path))
            this.write(this.defaultConfig);
        else {
            if(!isJsonSyntaxCorrect(fs.readFileSync(this.path).toString()))
                fs.rmSync(this.path)
            this.write({...this.defaultConfig, ...this.get()})
        }
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
        const oldObject = this.get();
        const newObject = deepmerge(oldObject, object);
        if(objectsAreSameType(newObject, oldObject)) this.write(newObject);
    }
    private get(): WinStateKeeper["defaultConfig"] {
        const parsedConfig = JSON.parse(fs.readFileSync(this.file).toString());
        if(objectsAreSameType(parsedConfig, this.defaultConfig))
            return parsedConfig;
        else
            return this.defaultConfig;
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