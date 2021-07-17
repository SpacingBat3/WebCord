/** 
 * lang.ts – everything associated with translating my app
 */

import * as fs from "fs";
import * as deepmerge from "deepmerge";
import { app } from "electron";
import { jsonParseWithComments } from "./global";

export type lang = {
	tray: {
		[key: string]: string;
	},
	context:{
		copy: string;
		paste: string;
		cut: string;
		dictionaryAdd: string;
		copyURL: string;
		copyURLText: string;
		inspectElement: string;
	},
	menubar: {
		enabled: string;
		file: {
			groupName: string;
			relaunch: string;
			quit: string;
			options: {
				groupName: string;
				disableTray: string;
				hideMenuBar: string;
				mobileMode: string;
				develMode: string;
				csp: { [key: string]: string; }
			},
			addon: {
				groupName: string;
				loadNode: string;
				loadChrome: string;
			}
		},
		edit: string;
		view: { [key: string]: string; },
		window: string;
	},
	dialog: {
		error: string;
		warning: string;
		hideMenuBar: string;
		devel: string;
		ver: {
			[key: string]: string;
		},
		permission: {
			check: {
				denied: string;
			},
			request: {
				denied: string;
			}
		},
		buttons: {
			[key: string]: string;
		},
		mod: {
			nodeExt: string;
			crx: string;
		}
	},
	help:{
		[key: string]: string;
	},
	misc:{
		singleInstance: string;
	}
}

function isJsonLang(object: Record<string,unknown>): object is lang {
	const langKeys = {
		topLevel: ['tray', 'context', 'menubar', 'dialog', 'help', 'misc']
	}
	let isTopObject = true;
	for (const key of langKeys.topLevel)
		if(typeof(object[key]) !== 'object') {
			isTopObject = false;
			break;
		}
	return	(
		isTopObject &&
		typeof((object as lang).tray) === 'object' &&
		typeof((object as lang).menubar.file.options.csp) === 'object' &&
		typeof((object as lang).menubar.file.addon.groupName) === 'string' &&
		typeof((object as lang).menubar.view) === 'object' &&
		typeof((object as lang).menubar.window) === 'string' &&
		typeof((object as lang).dialog.buttons ) === 'object' &&
		typeof((object as lang).dialog.mod) === 'object' &&
		typeof((object as lang).dialog.permission.check) === 'object' &&
		typeof((object as lang).dialog.permission.request) === 'object' &&
		typeof((object as lang).dialog.ver) === 'object'
	)
}

function jsonOrJsonc(fileNoExtension:string):string {
	if (fs.existsSync(fileNoExtension+'.jsonc'))
		return fileNoExtension+'.jsonc'
	else
		return fileNoExtension+'.json'
}

/**
 * Function that returns a JavaScript object by resolving a correct
 * path to JSON file containing strings in the current user language.
 * 
 * This function is designed to return a correct value while taking into
 * acount following scenarios:
 * 
 * - If it fails to find a such file, it will fallback to English
 *   strings instead.
 * 
 * - If translations are incomplete, it will mix English strings
 *   and translated strings.
 * 
 * - If main and/or fallback strings will be of incorrect type (ie.
 *   have some values missing or of incorrect type), it may output a
 *   TypeError and fail to return all or some strings.
 * 
 * Please note that this function uses `app.getLocale()` to guess
 * current user language, which means that this function **shouldn't
 * be executed when app is not ready**.
 *
 * On Linux, `LANG` enviroment variable can be used to force loading
 * app in different languages (ex. for testing purposes).
 */

export function loadTranslations():lang {
    let l10nStrings:lang|Record<string,unknown>;
    /**
     * Translated strings in the user language.
     * 
     * @todo
     * Make `localStrings` not overwrite `l10nStrings`
     * when they are of wrong type.
     */
    let localStrings:lang|Record<string,unknown>;
    const systemLang:string = app.getLocale();

	const localizedStrings = app.getAppPath()+"/sources/assets/translations/"+systemLang+"/strings"
	const fallbackStrings = app.getAppPath()+"/sources/assets/translations/en-GB/strings"
	
    if(!app.isReady()) console.warn(
		"[WARN] Electron may fail loading localized strings,\n"+
		"       because the app hasn't still emitted the 'ready' event!\n"+
		"[WARN] In this case, English strings will be used as a fallback.\n"
	);

    l10nStrings = jsonParseWithComments({path: jsonOrJsonc(fallbackStrings)});
    if(fs.existsSync(jsonOrJsonc(localizedStrings))) {
        localStrings = jsonParseWithComments({path: jsonOrJsonc(localizedStrings)});
        l10nStrings = deepmerge(l10nStrings, localStrings); 
    }
	if(!isJsonLang(l10nStrings)) {
		throw new TypeError('At least one of the "strings.json/strings.jsonc" files has invalid type')
	}
	return l10nStrings;
}