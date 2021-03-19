/*
 * Global interfaces and JSON objects (object.ts)
 */

import appConfig = require('electron-json-config');
import deepmerge = require('deepmerge');
import fs = require('fs')

let configJson;

if(fs.existsSync(appConfig.file())){
	configJson = require(appConfig.file());
} else {
	configJson = {};
}

// JSON Objects:
 
/* eslint-disable */
export const packageJson = require("../../package.json");
export const configData = deepmerge({
	hideMenuBar: false,
	mobileMode: false,
	disableTray: false,
	csp: {
		disabled: false,
		strict: false
	}
}, configJson)

// Interfaces:

export interface json { // currently unused
	[key: string]: any
}

export interface lang {
	tray: {
		[key: string]: string
	},
	context:{
		[key: string]: string
	},
	menubar: {
		enabled: string,
		file: { [key: string]: string },
		edit: string,
		view: string,
		window: string,
		options: {
			groupName: string,
			disableTray: string,
			hideMenuBar: string,
			mobileMode: string,
			csp: { [key: string]: string }
		}
	},
	dialog: {
		error: string,
		warning: string,
		hideMenuBar: string,
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