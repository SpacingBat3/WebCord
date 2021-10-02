/*
 * updateNotifier – notifications about the updates
 */

import { isPackageJsonComplete } from '../global'
import { app, Notification, shell, net } from 'electron';
import { appInfo, getBuildInfo } from './clientProperties';
import fetch from 'electron-fetch';
import l10n from './l10nSupport';

/**
 * Checks and notifies users about the updates.
 * 
 * @param strings Object containing language strings.
 * @param devel Boolean to detect whenever app is packaged.
 * @param appIcon Path to application icon.
 * @param updateInterval Object that indentifies currently running interval.
 */
export async function checkVersion(updateInterval: NodeJS.Timeout | undefined): Promise<void> {
    // Do not execute when offline.
    if (!net.isOnline()) return;
    // When app is not ready, wait until it is ready.
    if (!app.isReady()) await app.whenReady();
    // Initialize app translation.
    const strings = new l10n().strings;
    // An alias to app's repository name.
    const repoName = appInfo.repository.name;
    let remoteTag: string, updateMsg: string, updateURL: string, remoteHeader: string;
    let showGui = false;
    if (getBuildInfo().type === 'devel') {
        const remoteJson = await (await fetch('https://raw.githubusercontent.com/' + repoName + '/master/package.json')).json();
        if(!isPackageJsonComplete(remoteJson)) return
        remoteTag = remoteJson.version;
        remoteHeader = 'v';
        updateURL = 'https://github.com/' + repoName + '/commit/master';
    } else {
        const githubApi = await (await fetch('https://api.github.com/repos/' + repoName + '/releases/latest')).json();
        if (githubApi.tag_name.includes('v')) {
            remoteTag = githubApi.tag_name.substring(1);
            remoteHeader = 'v';
        } else if (githubApi.tag_name.match(/[a-z].*[0-9.]/) !== null) {
            const remoteTagArray = githubApi.tag_name.split('-');
            remoteTag = remoteTagArray[1];
            remoteHeader = remoteTagArray[0] + '-';
        } else {
            remoteTag = githubApi.tag_name;
            remoteHeader = 'v';
        }
        updateURL = 'https://github.com/' + repoName + '/releases/latest';
    }

    if (remoteTag > app.getVersion()) {
        showGui = true;
        updateMsg = strings.dialog.ver.update + ' (v' + app.getVersion() + ' → ' + remoteHeader + remoteTag + ')';
    } else if (remoteTag < app.getVersion()) {
        updateMsg = strings.dialog.ver.newer + ' (v' + app.getVersion() + ' → ' + remoteHeader + remoteTag + ')';
    } else if (remoteTag != app.getVersion()) {
        updateMsg = strings.dialog.ver.diff + ' (v' + app.getVersion() + ' ≠ ' + remoteHeader + remoteTag + ')';
    } else {
        updateMsg = strings.dialog.ver.recent;
    }

    console.log(strings.dialog.ver.updateBadge + ' ' + updateMsg);

    const updatePopup = {
        title: app.getName() + ": " + strings.dialog.ver.updateTitle,
        icon: appInfo.icon,
        body: updateMsg
    };
    if (showGui) {
        const notification = new Notification(updatePopup);
        notification.on('click', () => {
            shell.openExternal(updateURL);
        });
        notification.show();
    }
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}
