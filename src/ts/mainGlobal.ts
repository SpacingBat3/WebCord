/*
 * Declarations used in multiple files ()
 */

import { app } from 'electron';
import { factory } from 'electron-json-config';
import * as deepmerge from 'deepmerge';
import * as fs from 'fs';
import * as path from 'path';

// Check if app is packaged

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

// Basic application data

export const appInfo = {
    repoName: "SpacingBat3/WebCord",
    icon: guessDevel().appIconDir + "/app.png",
    trayIcon: app.getAppPath() + "/icons/tray.png",
    trayPing: app.getAppPath() + "/icons/tray-ping.png",
    rootURL: 'https://discord.com',
    URL: 'https://discord.com/app',
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

export const appConfig = factory(configs[0]);
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
			hcaptcha: false
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

export function loadTranslations():lang {
    let l10nStrings:lang, localStrings:lang;
    const systemLang:string = app.getLocale();
	if(!app.isReady()) {
		console.warn("[WARN] Can't determine system language when app is not ready!");
		console.warn("[WARN] It is propable  English strings will be used as fallback.");
	}
    l10nStrings = require("../lang/en-GB/strings.json"); // Fallback to English
    if(fs.existsSync(path.join(app.getAppPath(), "src/lang/"+systemLang+"/strings.json"))) {
        localStrings = require(app.getAppPath()+"/src/lang/"+systemLang+"/strings.json");
        l10nStrings = deepmerge(l10nStrings, localStrings);
    }
    return l10nStrings;
}