/*
 * Global interfaces and JSON objects (object.ts)
 */

import { app } from 'electron';
import { factory, Conf } from 'electron-json-config';
import * as deepmerge from 'deepmerge';
import * as fs from 'fs';
import * as path from 'path';

const tmpdir = app.getPath('temp')+'/'+app.getName();

function isJson (string:string) {
	try {
		JSON.parse(string);
	} catch {
		return false
	}
	return true
}

function tempConfig():Conf {
	if(!fs.existsSync(tmpdir)) {
		fs.mkdirSync(tmpdir, { recursive: true });
	}
	return factory(tmpdir+"/globalVars.json",tmpdir);
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
			console.warn("[WARN] Removed '"+path.basename(file)+" due to syntax errors.")
		}
	}
}

// Export app configuration files

export const appConfig = factory(configs[0]);
export const winStorage = factory(configs[1]);
// export const globalVars = tempConfig(); // todo: use eventEmitter instead

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

// Interfaces:

export interface lang {
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
		file: { [key: string]: string },
		edit: string,
		view: { [key: string]: string },
		window: string,
		options: {
			groupName: string,
			disableTray: string,
			hideMenuBar: string,
			mobileMode: string,
			develMode: string,
			csp: { [key: string]: string }
		}
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
		}
	},
	help:{
		[key: string]: string
	}
}