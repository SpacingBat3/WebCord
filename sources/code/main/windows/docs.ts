import { app, BrowserWindow, ipcMain } from 'electron';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { appInfo } from '../modules/client';
import { initWindow } from '../modules/parent';

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

export default function loadDocsWindow(parent: BrowserWindow):BrowserWindow|undefined {
    const docsWindow = initWindow("docs", parent, {
        minWidth: appInfo.minWinWidth,
		minHeight: appInfo.minWinHeight,
        width: 800,
        height: 720
    });
    if(docsWindow === undefined) return;
    handleEvents(docsWindow);
    docsWindow.webContents.on('did-start-loading', () => handleEvents(docsWindow));
    return docsWindow
}