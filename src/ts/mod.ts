/*
 * Mod.ts – NODE-based customization pack support
 */

import { app, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path'
import { loadTranslations } from './mainGlobal';

export const loadNodeAddons = async function(window:BrowserWindow):Promise<void>{
    const strings = loadTranslations();
    const files = dialog.showOpenDialogSync({
        title: strings.menubar.file.addon.loadNode,
        filters: [
            { name: strings.dialog.mod.nodeExt, extensions: ["asar"] }
        ]
    });
    if (files===undefined) return;
    for (const file in files) {
        const modJson = JSON.parse(fs.readFileSync(file+"/package.json",'utf-8'));
        if(modJson===undefined) return;
        const modInfo = {
            name: modJson.productName||modJson.name||"Modified",
            icon: path.join(file+'/'+modJson.webcord.icon),
            css: path.join(file+'/'+modJson.webcord.css),
            preload: path.join(file+'/'+modJson.webcord.preload)
        }
        if(!fs.existsSync(modInfo.preload)) return;
        app.setName(app.getName()+' ('+modInfo.name+')');
        if(fs.existsSync(modInfo.icon)) window.setIcon(modInfo.icon);
    }
}

export const loadChromeAddons = async function(window:BrowserWindow):Promise<void> {
    const strings = loadTranslations();
    const session = window.webContents.session;
    const files = dialog.showOpenDialogSync({
        title: strings.menubar.file.addon.loadChrome,
        filters: [
            { name: strings.dialog.mod.crx, extensions: ["crx"] }
        ]
    });
    if (files===undefined) return;
    for (const file in files) session.loadExtension(file);
}