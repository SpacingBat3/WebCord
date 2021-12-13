/*
 * Declarations used between multiple files (main scripts only)
 */

import { app } from 'electron';
import { resolve } from 'path';
import { packageJson, Person, buildInfo, isBuildInfo } from '../../global';
import { readFileSync } from 'fs';

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
	trayUnread: resolve(app.getAppPath(), "sources/assets/icons/tray-unread.png"),
	trayPing: resolve(app.getAppPath(), "sources/assets/icons/tray-ping.png"),
	minWinHeight: 412,
	minWinWidth: 312
};