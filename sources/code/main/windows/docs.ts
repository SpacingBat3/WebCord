import { app, BrowserWindow, ipcMain, session } from 'electron';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { appInfo, getBuildInfo } from '../modules/client';

import l10n from '../../modules/l10n';

function handleEvents(docsWindow: BrowserWindow) {
    // Guess correct Readme.md file
    let readmeFile = 'docs/Readme.md';
    if(existsSync(resolve(app.getAppPath(), 'docs', app.getLocale(), 'Readme.md')))
        readmeFile = 'docs/'+app.getLocale()+'/Readme.md'
    ipcMain.once('documentation-load', (event) => {
        ipcMain.once('documentation-load', () => {
            if(!docsWindow.isDestroyed()) {
                docsWindow.show();
            }
        })
        event.reply('documentation-load', resolve(app.getAppPath(), readmeFile));
    })
}

export default function loadDocsWindow(parent: BrowserWindow):BrowserWindow {
    const strings = (new l10n()).client;
    const docsWindow = new BrowserWindow({
        title: app.getName() + ' – ' + strings.help.docs,
        show: false,
        parent: parent,
        minWidth: appInfo.minWinWidth,
		minHeight: appInfo.minWinHeight,
        width: 800,
        height: 720,
        backgroundColor: appInfo.backgroundColor,
        webPreferences: {
            session: session.fromPartition("temp:docs"),
            preload: resolve(app.getAppPath(), 'sources/app/renderer/preload/docs.js'),
            defaultFontFamily: {
                standard: 'Arial' // `sans-serif` as default font.
            }
        }
    });
    docsWindow.loadFile(resolve(app.getAppPath(), 'sources/assets/web/html/docs.html'));
    handleEvents(docsWindow);
    docsWindow.webContents.on('did-start-loading', () => handleEvents(docsWindow));
    docsWindow.webContents.session.setPermissionCheckHandler(() => false);
    docsWindow.webContents.session.setPermissionRequestHandler((_webContents,_permission,callback) => {
        callback(false);
    });
    docsWindow.webContents.session.setDevicePermissionHandler(()=> false);
    docsWindow.setAutoHideMenuBar(true);
    docsWindow.setMenuBarVisibility(false);
    if(getBuildInfo().type === 'release') docsWindow.removeMenu();
    return docsWindow
}