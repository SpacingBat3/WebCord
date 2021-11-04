/*
 * Declarations used between multiple files (main scripts only)
 */

import { app } from 'electron';
import { resolve } from 'path';
import { packageJson, Person } from '../../global';
import { readFileSync } from 'fs';


interface buildInfo {
	type: 'release' | 'devel',
	commit?: string;
}

export function isBuildInfo(object: unknown): object is buildInfo {
	if (!(object instanceof Object))
		return false;
	if (!Object.prototype.hasOwnProperty.call(object, 'type')) return false;
	switch ((object as buildInfo).type) {
		case 'release':
		case 'devel':
			break;
		default:
			return false;
	}
	if (Object.prototype.hasOwnProperty.call(object, 'commit'))
		if (!(typeof (object as buildInfo).commit === 'string'))
			return false;
	return true;
}

export function getBuildInfo(): buildInfo {
	try {
		const data = readFileSync(resolve(app.getAppPath(), 'buildInfo.json'));
		const buildInfo = JSON.parse(data.toString());
		if (isBuildInfo(buildInfo))
			return buildInfo
		else
			return { type: 'devel' }
	} catch {
		return { type: 'devel' }
	}
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
	icon: resolve(app.getAppPath(), "sources/assets/icons/app.png"),
	trayIcon: resolve(app.getAppPath(), "sources/assets/icons/tray.png"),
	trayPing: resolve(app.getAppPath(), "sources/assets/icons/tray-ping.png"),
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