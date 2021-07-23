/** 
 * TranslatedStrings.ts – everything associated with translating my app
 */

import * as fs from "fs";
import * as deepmerge from "deepmerge";
import { app } from "electron";
import { jsonParseWithComments } from "./global";

function jsonOrJsonc(fileNoExtension:string):string {
	if (fs.existsSync(fileNoExtension+'.jsonc'))
		return fileNoExtension+'.jsonc'
	else
		return fileNoExtension+'.json'
} 

function isJsonTranslatedStrings(object: unknown): object is TranslatedStrings {
	type TranslatedStringsKeys = {
		topLevel: ['tray', 'context', 'menubar', 'dialog', 'help', 'misc', 'settings']
	}
	const TranslatedStringsKeys:TranslatedStringsKeys = {
		topLevel: ['tray', 'context', 'menubar', 'dialog', 'help', 'misc', 'settings']
	}
	let isTopObject = true;
	for(const property of TranslatedStringsKeys.topLevel) if (typeof((object as TranslatedStrings)[property]) !== 'object')
		isTopObject = false;
	return	(
		isTopObject &&
		typeof((object as TranslatedStrings).menubar.file.options.csp) === 'object' &&
		typeof((object as TranslatedStrings).menubar.file.addon.groupName) === 'string' &&
		typeof((object as TranslatedStrings).menubar.view) === 'object' &&
		typeof((object as TranslatedStrings).menubar.window) === 'string' &&
		typeof((object as TranslatedStrings).dialog.buttons ) === 'object' &&
		typeof((object as TranslatedStrings).dialog.mod) === 'object' &&
		typeof((object as TranslatedStrings).dialog.permission.check) === 'object' &&
		typeof((object as TranslatedStrings).dialog.permission.request) === 'object' &&
		typeof((object as TranslatedStrings).dialog.ver) === 'object' &&
		typeof((object as TranslatedStrings).settings.basic.group.menuBar) === 'object' &&
		typeof((object as TranslatedStrings).settings.basic.group.tray) === 'object' &&
		typeof((object as TranslatedStrings).settings.advanced.group.csp.group.thirdparty.list.gifProviders) === 'string'
	)
}

/**
 * The class that can be used to get an object containing translated strings and/or English strings if translation is missing.
 * 
 * Currently, it will load the translations correctly at following conditions:
 * 
 * - if application is `ready`,
 * - if both translated and fallback strings are of compatible type and
 *   their `deepmerge` contains basics *shape* of the object returned by class,
 * - if fallback strings file exists and can be accessed using `fs.readFileSync()` function.
 * 
 * In other situations, there should be displayed `TypeError` and the application would eventually crash.
 */

export class TranslatedStrings {
	readonly tray!: {
		readonly toggle: string;
		readonly quit: string;
	};
	readonly context!:{
		readonly copy: string;
		readonly paste: string;
		readonly cut: string;
		readonly dictionaryAdd: string;
		readonly copyURL: string;
		readonly copyURLText: string;
		readonly inspectElement: string;
	};
	readonly menubar!: {
		readonly enabled: string;
		readonly file: {
			readonly groupName: string;
			readonly quit: string;
			readonly relaunch: string;
			readonly options: {
				readonly groupName: string;
				readonly disableTray: string;
				readonly hideMenuBar: string;
				readonly mobileMode: string;
				readonly csp: {
					readonly groupName: string;
					readonly thirdparty: string;
					readonly gifProviders: string;
				};
				readonly develMode: string;
			};
			readonly addon: {
				readonly groupName: string;
				readonly loadNode: string;
				readonly loadChrome: string;
			}
		};
		readonly edit: string;
		readonly view: {
			readonly groupName: string;
			readonly reload: string;
			readonly forceReload: string;
			readonly devTools: string;
			readonly resetZoom: string;
			readonly zoomIn: string;
			readonly zoomOut: string;
			readonly fullScreen: string;
		};
		readonly window: string;
	};
	readonly dialog!: {
		readonly error: string;
		readonly warning: string;
		readonly ver: {
			readonly update: string;
			readonly updateBadge: string;
			readonly updateTitle: string;
			readonly recent: string;
			readonly newer: string;
			readonly diff: string;
		};
		readonly permission: {
			readonly request: {
				readonly denied: string;
			};
			readonly check: {
				readonly denied: string;
			}
		};
		readonly buttons: {
			readonly continue: string;
			readonly yes: string;
			readonly no: string;
		};
		readonly mod: {
			readonly nodeExt: string;
			readonly crx: string;
		};
		readonly hideMenuBar: string;
		readonly devel: string;
	};
	readonly help!:{
		readonly groupName: string;
		readonly about: string;
		readonly repo: string;
		readonly docs: string;
		readonly bugs: string;
		readonly contributors: string;
		readonly credits: string;
	};
	readonly settings!: {
		readonly basic: {
			readonly name: string;
			readonly group: {
				readonly menuBar: {
					readonly name: string;
					readonly description: string;
					readonly label: string;
				};
				readonly tray: {
					readonly name: string;
					readonly description: string;
					readonly label: string;
				}
			}
		};
		readonly advanced: {
			readonly name: string;
			readonly group: {
				readonly csp: {
					readonly name: string;
					readonly description: string;
					readonly group: {
						readonly thirdparty: {
							readonly name: string,
							readonly list: {
								readonly gifProviders: string;
							}
						}
					}
				}
			}
		}
	};
	readonly misc!: {
		readonly singleInstance: string;
	}
	constructor () {
		let l10nStrings:Record<string,unknown>;
		/**
		 * Translated strings in the user TranslatedStringsuage.
		 * 
		 * @todo
		 * Make `localStrings` not overwrite `l10nStrings`
		 * when they are of wrong type.
		 */
		let localStrings:Record<string,unknown>;
		const systemTranslatedStrings:string = app.getLocale();
	
		const localizedStrings = app.getAppPath()+"/sources/assets/translations/"+systemTranslatedStrings+"/strings"
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
		if(isJsonTranslatedStrings(l10nStrings)) {
			this.tray = l10nStrings.tray
			this.context = l10nStrings.context
			this.dialog = l10nStrings.dialog
			this.help = l10nStrings.help
			this.menubar = l10nStrings.menubar
			this.misc = l10nStrings.misc
			this.settings = l10nStrings.settings
			this.tray = l10nStrings.tray
		} else {
			throw new TypeError('At least one of the JSON/JSONC strings translation files is of invalid type!')
		}
	}
}