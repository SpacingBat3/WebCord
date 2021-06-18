/*
 * Declarations used in multiple files ()
 */

import { app } from 'electron';
import { factory } from 'electron-json-config';
import * as deepmerge from 'deepmerge';
import * as fs from 'fs';
import * as path from 'path';
import { packageJson, Person } from './global';

/**
 * Guesses whenever application is packaged (in *ASAR* format).
 * 
 * This function is used to block some broken or untested features that
 * needs to be improved before releasing. To test these features, you have to run
 * app from the sources with `npm start` command.
 */
export function guessDevel ():{ devel:boolean, devFlag:string, appIconDir:string } {
	let devel:boolean, devFlag:string, appIconDir:string;
	if (app.getAppPath().indexOf(".asar") < 0) {
		devel = true;
		devFlag = " [DEV]";
		appIconDir = app.getAppPath() + "/icons";
	} else {
		devel = false;
		devFlag = "";
		appIconDir = path.join(app.getAppPath(), "..");
	}
	return { devel:devel, devFlag:devFlag, appIconDir:appIconDir }
}

function person2string(person:Person):string {
	if(person.name)
		return person.name
	return person
}

/** Basic application details. */
export const appInfo = {
	/** Application repository details */
    repository: {
		/** Repository indentifier in format `author/name`. */
		name: person2string(packageJson.author)+'/'+app.getName(),
		/** Web service on which app repository is published. */
		provider: 'github.com'
	},
    icon: guessDevel().appIconDir + "/app.png",
    trayIcon: app.getAppPath() + "/icons/tray.png",
    trayPing: app.getAppPath() + "/icons/tray-ping.png",
    rootURL: 'https://discord.com',
    URL: 'https://watchanimeattheoffice.com/app',
    minWinHeight: 412,
    minWinWidth: 312
}

function isJson (string:string) {
	try {
		JSON.parse(string);
	} catch {
		return false
	}
	return true
}

// Check configuration files for errors

const configs:Array<string> = [
	app.getPath('userData')+"/config.json",
	app.getPath('userData')+"/windowState.json"
]

for (const file of configs) {
	if(fs.existsSync(file)) {
		const stringOfFile = fs.readFileSync(file).toString()
		if(!isJson(stringOfFile)) {
			fs.rmSync(file);
			console.warn("[WARN] Removed '"+path.basename(file)+"' due to syntax errors.")
		}
	}
}

// Export app configuration files

/** An object used to return current app configuration. */
export const appConfig = factory(configs[0]);
/** Contains functions to return and save current window position and state. */
export const winStorage = factory(configs[1]);

// JSON Objects:
export const configData = deepmerge({
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
			twich: false,
			streamable: false,
			vimeo: false,
			soundcloud: false,
			paypal: false,
			audius: false
		}
	}
}, appConfig.all())

export function getDevel(dev:boolean,conf:boolean):boolean {
	if(dev) {
		return dev;
	} else {
		return conf;
	}
}

// Translations (interface and function):

export type lang = {
	tray: {
		[key: string]: string
	},
	context:{
		copy: string,
		paste: string,
		cut: string,
		dictionaryAdd: string,
		copyURL: string,
		copyURLText: string,
		inspectElement: string
	},
	menubar: {
		enabled: string,
		file: {
			groupName: string,
			relaunch: string,
			quit: string,
			options: {
				groupName: string,
				disableTray: string,
				hideMenuBar: string,
				mobileMode: string,
				develMode: string,
				csp: { [key: string]: string }
			},
			addon: {
				groupName: string,
				loadNode: string,
				loadChrome: string
			}
		},
		edit: string,
		view: { [key: string]: string },
		window: string,
	},
	dialog: {
		error: string,
		warning: string,
		hideMenuBar: string,
		devel: string,
		ver: {
			[key: string]: string
		},
		permission: {
			[key: string]: { [key: string]: string }
		},
		buttons: {
			[key: string]: string
		},
		mod: {
			nodeExt: string,
			crx: string
		}
	},
	help:{
		[key: string]: string
	},
	misc:{
		singleInstance: string
	}
}

/**
 * Function that returns a path to JSON file containing strings
 * in the user language.
 * 
 * Please note that this function uses `app.getLocale()` to guess
 * current user language, which means that this function **shouldn't
 * be executed when app is not ready**.
 * 
 * On Linux, `LANG` enviroment variable can be used to force loading
 * app in different language.
 */
export function loadTranslations():lang {
    let l10nStrings:lang, localStrings:lang;
    const systemLang:string = app.getLocale();
	if(!app.isReady()) {
		console.warn("[WARN] Can't determine system language when app is not ready!");
		console.warn("[WARN] In this case, English strings will be used as fallback.");
	}
    l10nStrings = require("../lang/en-GB/strings.json"); // Fallback to English
    if(fs.existsSync(path.join(app.getAppPath(), "src/lang/"+systemLang+"/strings.json"))) {
        localStrings = require(app.getAppPath()+"/src/lang/"+systemLang+"/strings.json");
        l10nStrings = deepmerge(l10nStrings, localStrings);
    }
    return l10nStrings;
}