/** 
 * TranslatedStrings.ts – everything associated with translating my app
 */

import * as path from "path";
import * as fs from "fs";
import * as deepmerge from "deepmerge";
import { app } from "electron";
import JSONC from "../internalModules/jsoncParser"

function jsonOrJsonc(fileNoExtension: string): string {
	if (fs.existsSync(fileNoExtension + '.jsonc'))
		return fileNoExtension + '.jsonc';
	else
		return fileNoExtension + '.json';
}

function isJsonTranslatedStrings(object: unknown): object is TranslatedStrings {
	type TranslatedStringsKeys = {
		topLevel: ['tray', 'context', 'menubar', 'dialog', 'help', 'misc', 'settings'];
	};
	const TranslatedStringsKeys: TranslatedStringsKeys = {
		topLevel: ['tray', 'context', 'menubar', 'dialog', 'help', 'misc', 'settings']
	};
	let isTopObject = true;
	for (const property of TranslatedStringsKeys.topLevel) if (typeof ((object as TranslatedStrings)[property]) !== 'object')
		isTopObject = false;
	return (
		isTopObject &&
		typeof ((object as TranslatedStrings).menubar.file.options.csp) === 'object' &&
		typeof ((object as TranslatedStrings).menubar.file.addon.groupName) === 'string' &&
		typeof ((object as TranslatedStrings).menubar.view) === 'object' &&
		typeof ((object as TranslatedStrings).menubar.window) === 'string' &&
		typeof ((object as TranslatedStrings).dialog.buttons) === 'object' &&
		typeof ((object as TranslatedStrings).dialog.mod) === 'object' &&
		typeof ((object as TranslatedStrings).dialog.permission.check) === 'object' &&
		typeof ((object as TranslatedStrings).dialog.permission.request) === 'object' &&
		typeof ((object as TranslatedStrings).dialog.ver) === 'object' &&
		typeof ((object as TranslatedStrings).settings.basic.group.menuBar) === 'object' &&
		typeof ((object as TranslatedStrings).settings.basic.group.tray) === 'object' &&
		typeof ((object as TranslatedStrings).settings.advanced.group.csp.group.thirdparty.list.gifProviders) === 'string'
	);
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
	tray: {
		toggle: string;
		quit: string;
	};
	context: {
		copy: string;
		paste: string;
		cut: string;
		dictionaryAdd: string;
		copyURL: string;
		copyURLText: string;
		inspectElement: string;
	};
	menubar: {
		enabled: string;
		file: {
			groupName: string;
			quit: string;
			relaunch: string;
			options: {
				groupName: string;
				disableTray: string;
				hideMenuBar: string;
				mobileMode: string;
				csp: {
					groupName: string;
					thirdparty: string;
					gifProviders: string;
				};
				develMode: string;
			};
			addon: {
				groupName: string;
				loadNode: string;
				loadChrome: string;
			};
		};
		edit: string;
		view: {
			groupName: string;
			reload: string;
			forceReload: string;
			devTools: string;
			resetZoom: string;
			zoomIn: string;
			zoomOut: string;
			fullScreen: string;
		};
		window: string;
	};
	dialog: {
		error: string;
		warning: string;
		ver: {
			update: string;
			updateBadge: string;
			updateTitle: string;
			recent: string;
			newer: string;
			diff: string;
		};
		permission: {
			request: {
				denied: string;
			};
			check: {
				denied: string;
			};
		};
		buttons: {
			continue: string;
			yes: string;
			no: string;
		};
		mod: {
			nodeExt: string;
			crx: string;
		};
		hideMenuBar: string;
		devel: string;
	};
	help: {
		groupName: string;
		about: string;
		repo: string;
		docs: string;
		bugs: string;
		contributors: string;
		credits: string;
	};
	settings: {
		basic: {
			name: string;
			group: {
				menuBar: {
					name: string;
					description: string;
					label: string;
				};
				tray: {
					name: string;
					description: string;
					label: string;
				};
			};
		};
		advanced: {
			name: string;
			group: {
				csp: {
					name: string;
					description: string;
					group: {
						thirdparty: {
							name: string,
							list: {
								gifProviders: string;
							};
						};
					};
				};
			};
		};
	};
	misc: {
		singleInstance: string;
	};
	constructor() {
		let l10nStrings: Record<string, unknown>;
		/**
		 * Translated strings in the user TranslatedStringsuage.
		 * 
		 * @todo
		 * Make `localStrings` not overwrite `l10nStrings`
		 * when it is of wrong type.
		 */
		let localStrings: Record<string, unknown>;

		const fallbackStrings = path.resolve(app.getAppPath(), "sources/assets/translations/en-GB/strings");
		let localizedStrings = path.resolve(app.getAppPath(), "sources/assets/translations/" + app.getLocale() + "/strings");
		const externalStrings = path.resolve(path.dirname(app.getAppPath()), 'translations/' + app.getLocale() + "/strings");

		/* Handle unofficial translations */

		if (!fs.existsSync(jsonOrJsonc(localizedStrings)))
			localizedStrings = externalStrings;

		if (!app.isReady()) console.warn(
			"[WARN] Electron may fail loading localized strings,\n" +
			"       because the app hasn't still emitted the 'ready' event!\n" +
			"[WARN] In this case, English strings will be used as a fallback.\n"
		);

		l10nStrings = JSONC.parse({ path: jsonOrJsonc(fallbackStrings) });
		if (fs.existsSync(jsonOrJsonc(localizedStrings)) && localizedStrings !== fallbackStrings) {
			localStrings = JSONC.parse({ path: jsonOrJsonc(localizedStrings) });
			l10nStrings = deepmerge(l10nStrings, localStrings);
		}
		if (isJsonTranslatedStrings(l10nStrings)) {
			this.tray = l10nStrings.tray;
			this.context = l10nStrings.context;
			this.dialog = l10nStrings.dialog;
			this.help = l10nStrings.help;
			this.menubar = l10nStrings.menubar;
			this.misc = l10nStrings.misc;
			this.settings = l10nStrings.settings;
			this.tray = l10nStrings.tray;
		} else {
			throw new TypeError('At least one of the JSON/JSONC strings translation files is of invalid type!');
		}
	}
}