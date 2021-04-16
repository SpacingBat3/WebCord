/*
 * Global interfaces and JSON objects (object.ts)
 */

import { app } from 'electron';
import { factory, Conf } from 'electron-json-config';
import deepmerge = require('deepmerge');
import fs = require('fs');

const tmpdir = app.getPath('temp')+'/'+app.getName();

function tempConfig():Conf {
	if(!fs.existsSync(tmpdir)) {
		fs.mkdirSync(tmpdir, { recursive: true });
	}
	return factory(tmpdir+"/globalVars.json",tmpdir);
}

export const appConfig = factory();
export const winStorage = factory(app.getPath('userData')+"/windowState.json");
export const globalVars = tempConfig();

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