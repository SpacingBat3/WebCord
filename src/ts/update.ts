/*
 * Update checker (update.ts)
 */

import { Notification, shell } from 'electron';
import { packageJson, lang } from './object.js';
import fetch from 'electron-fetch';

export async function checkVersion(strings: lang, devel: boolean, repoName: string, appIcon: string, updateInterval: number|undefined): Promise<void>{
    const remoteJson = await (await fetch(`https://raw.githubusercontent.com/${repoName}/master/package.json`)).json();
    const githubApi = await (await fetch(`https://api.github.com/repos/${repoName}/releases/latest`)).json();
    const localVersion = packageJson.version.split('.');
    let remoteTag:string, updateMsg:string, updateURL:string, remoteHeader:string;
    let showGui = false;
    if(devel){
        remoteTag = remoteJson.version;
        remoteHeader = 'v';
        updateURL = `https://github.com/${repoName}/commit/master`;
    } else {
        if (githubApi.tag_name.includes('v')) {
            remoteTag = githubApi.tag_name.substring(1);
            remoteHeader = 'v';
        } else if (githubApi.tag_name.includes('beta-')) {
            const remoteTagArray = githubApi.tag_name.split('-');
            remoteTag = remoteTagArray[1];
            remoteHeader = remoteTagArray[0] + '-';
        } else {
            remoteTag = githubApi.tag_name;
            remoteHeader = 'v';
        }
        updateURL = `https://github.com/${repoName}/releases/latest`;
    }
    const remoteVersion = remoteTag.split('.');

    if(localVersion[0] < remoteVersion[0] || (localVersion[0] == remoteVersion[0] && localVersion[1] < remoteVersion[1]) || (localVersion[0] == remoteVersion[0] && localVersion[1] == remoteVersion[1] && localVersion[2] < remoteVersion[2])) {
        showGui = true
        updateMsg = `${strings.dialog.ver.update} (v${packageJson.version} → ${remoteHeader}${remoteTag})`;
    } else if(localVersion[0] > remoteVersion[0] || (localVersion[0] == remoteVersion[0] && localVersion[1] > remoteVersion[1]) || (localVersion[0] == remoteVersion[0] && localVersion[1] == remoteVersion[1] && localVersion[2] > remoteVersion[2])) {
        updateMsg = `${strings.dialog.ver.newer} (v${packageJson.version} → ${remoteHeader}${remoteTag})`;
    } else if(localVersion[0] != remoteVersion[0] || localVersion[1] != remoteVersion[1] || localVersion[2] != remoteVersion[2]) {
        updateMsg = `${strings.dialog.ver.diff} (v${packageJson.version} ≠ ${remoteHeader}${remoteTag})`;
    } else {
        updateMsg = strings.dialog.ver.recent;
    }

    console.log(strings.dialog.ver.updateBadge+' '+updateMsg);

    const updatePopup = {
        title: packageJson.productName+": "+strings.dialog.ver.updateTitle,
        icon: appIcon,
        body: updateMsg
    }
    if(showGui){
        const notification = new Notification(updatePopup);
        notification.on('click', () => {
            shell.openExternal(updateURL);
        });
        notification.show();
    }
    if(updateInterval){
        clearInterval(updateInterval);
    }
}