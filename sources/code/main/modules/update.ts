/*
 * update – notifications about the updates
 */

import { app, Notification, shell, net } from 'electron';
import { appInfo, getBuildInfo } from './client';
import fetch from 'electron-fetch';
import l10n from '../../global/modules/l10n';
import * as semver from 'semver';
import colors from '@spacingbat3/kolor';
import { commonCatches } from './error';

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
    const strings = new l10n().client;
    // An alias to app's repository name.
    const repoName = appInfo.repository.name;
    let updateMsg: string, showGui = false;
    const githubApi:Record<string,string> = await (await fetch('https://api.github.com/repos/' + repoName + '/releases/latest')).json();
    switch(semver.compare(githubApi.tag_name,app.getVersion())) {
        case 0:
            // Application version is the same as in tag
            updateMsg = strings.dialog.ver.recent;
            break;
        case 1:
            showGui = true;
            updateMsg = strings.dialog.ver.update +
                ' (v' + app.getVersion() + ' → v' + githubApi.tag_name.replace(/^v(.+)$/,'$1') + ')';
            break;
        case -1:
            // Application is newer than remote version.
            if(getBuildInfo().type === 'devel')
                updateMsg = strings.dialog.ver.devel
            else
                updateMsg = strings.dialog.ver.downgrade +
                    ' (v' + app.getVersion() + ' → v' + githubApi.tag_name.replace(/^v(.+)$/,'$1') + ')';
            break;
        default:
            // If version can't be parsed by semver.
            throw new Error("Couldn't compare versions while doing an update");
    }
    console.log(colors.bold(colors.blue(strings.dialog.ver.updateBadge)) + ' ' + updateMsg);

    const updatePopup:Electron.NotificationConstructorOptions = {
        title: app.getName() + ": " + strings.dialog.ver.updateTitle,
        icon: appInfo.icon,
        body: updateMsg
    };
    if (showGui && (getBuildInfo()?.features?.updateNotifications ?? true)) {
        const notification = new Notification(updatePopup);
        notification.on('click', () => {
            shell.openExternal(githubApi.html_url).catch(commonCatches.throw);
        });
        notification.show();
    }
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}
