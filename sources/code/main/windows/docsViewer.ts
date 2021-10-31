import { app, BrowserWindow, ipcMain, session } from 'electron';
//import { appInfo } from '../properties';
//import { packageJson } from '../../global';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { appInfo, getBuildInfo } from '../clientProperties';

import l10n from '../../modules/l10nSupport';

function handleEvents(docsWindow: BrowserWindow) {
    // Guess correct Readme.md file
    let readmeFile = 'docs/Readme.md';
    if(existsSync(resolve(app.getAppPath(), 'docs', app.getLocale(), 'Readme.md')))
        readmeFile = 'docs/'+app.getLocale()+'/Readme.md'
    console.log()
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
        webPreferences: {
            session: session.fromPartition("temp:docs"),
            preload: resolve(app.getAppPath(), 'sources/app/renderer/preload/docs.js')
        }
    });
    docsWindow.loadFile(resolve(app.getAppPath(), 'sources/assets/web/html/docs.html'));
    handleEvents(docsWindow);
    docsWindow.webContents.on('did-start-loading', () => handleEvents(docsWindow));
    ipcMain.on('documentation-reload', (event, href:string, file:string) => {
        // Guess original markdown file path without knowing it at all.
        console.log(file)
        let path = resolve(app.getAppPath(), 'docs/pl', file);
        if(!existsSync(path))
            path = resolve(app.getAppPath(), 'docs', file);
        console.log(path);
        event.reply('documentation-reload', href, readFileSync(path).toString())
    })
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