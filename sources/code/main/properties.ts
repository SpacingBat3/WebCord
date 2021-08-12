/*
 * Declarations used in multiple files (main scripts only)
 */

import { app } from 'electron';
import { resolve } from 'path';
import { packageJson, Person } from '../global';

/**
 * Guesses whenever application is packaged (in *ASAR* format).
 * 
 * This function is used to block some broken or untested features that
 * needs to be improved before releasing. To test these features, you have to run
 * app from the sources with `npm start` command.
 */
export function guessDevel(): { devel: boolean, devFlag: string, appIconDir: string; } {
	let devel: boolean, devFlag: string, appIconDir: string;
	if (app.getAppPath().indexOf(".asar") < 0) {
		devel = true;
		devFlag = " [DEV]";
		appIconDir = app.getAppPath() + "/sources/assets/icons";
	} else {
		devel = false;
		devFlag = "";
		appIconDir = resolve(app.getAppPath(), "..");
	}
	return { devel: devel, devFlag: devFlag, appIconDir: appIconDir };
}

function person2string(person: Person) {
	if (person.name)
		return person.name;
	return person;
}

/** Basic application details. */
export const appInfo = {
	/** Application repository details */
	repository: {
		/** Repository indentifier in format `author/name`. */
		name: person2string(packageJson.author) + '/' + app.getName(),
		/** Web service on which app repository is published. */
		provider: 'github.com'
	},
	icon: guessDevel().appIconDir + "/app.png",
	trayIcon: app.getAppPath() + "/sources/assets/icons/tray.png",
	trayPing: app.getAppPath() + "/sources/assets/icons/tray-ping.png",
	rootURL: 'https://discord.com',
	URL: 'https://watchanimeattheoffice.com/app',
	minWinHeight: 412,
	minWinWidth: 312
};

export function getDevel(dev: boolean, conf: boolean): boolean {
	if (dev) {
		return dev;
	} else {
		return conf;
	}
}