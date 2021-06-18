/*
 * Update checker (update.ts)
 */

import { app, Notification, shell, net } from 'electron';
import { lang, appInfo } from './mainGlobal';
import fetch from 'electron-fetch';

/**
 * Checks and notifies users about the updates.
 * 
 * @param strings Object containing language strings.
 * @param devel Boolean to detect whenever app is packaged.
 * @param appIcon Path to application icon.
 * @param updateInterval Object that indentifies currently running interval.
 */
export async function checkVersion(strings: lang, devel: boolean, appIcon: string, updateInterval: NodeJS.Timeout|undefined): Promise<void>{
    if(!net.isOnline()) return;
    const repoName = appInfo.repository.name;
    const remoteJson = await (await fetch('https://raw.githubusercontent.com/'+repoName+'/master/package.json')).json();
    const githubApi = await (await fetch('https://api.github.com/repos/'+repoName+'/releases/latest')).json();
    let remoteTag:string, updateMsg:string, updateURL:string, remoteHeader:string;
    let showGui = false;
    if(devel){
        remoteTag = remoteJson.version;
        remoteHeader = 'v';
        updateURL = 'https://github.com/'+repoName+'/commit/master';
    } else {
        if (githubApi.tag_name.includes('v')) {
            remoteTag = githubApi.tag_name.substring(1);
            remoteHeader = 'v';
        } else if (githubApi.tag_name.match(/[a-z].*[0-9.]/)!==null) {
            const remoteTagArray = githubApi.tag_name.split('-');
            remoteTag = remoteTagArray[1];
            remoteHeader = remoteTagArray[0] + '-';
        } else {
            remoteTag = githubApi.tag_name;
            remoteHeader = 'v';
        }
        updateURL = 'https://github.com/'+repoName+'/releases/latest';
    }

    if(remoteTag > app.getVersion()) {
        showGui = true
        updateMsg = strings.dialog.ver.update+' (v'+app.getVersion()+' → '+remoteHeader+remoteTag+')';
    } else if(remoteTag < app.getVersion()) {
        updateMsg = strings.dialog.ver.newer+' (v'+app.getVersion()+' → '+remoteHeader+remoteTag+')';
    } else if(remoteTag != app.getVersion()) {
        updateMsg = strings.dialog.ver.diff+' (v'+app.getVersion()+' ≠ '+remoteHeader+remoteTag+')';
    } else {
        updateMsg = strings.dialog.ver.recent;
    }

    console.log(strings.dialog.ver.updateBadge+' '+updateMsg);

    const updatePopup = {
        title: app.getName()+": "+strings.dialog.ver.updateTitle,
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
