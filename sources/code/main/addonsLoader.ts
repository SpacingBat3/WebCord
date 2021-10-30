/*
 * Mod.ts – NODE-based customization pack support
 */

import { app, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import l10n from './l10nSupport';
/**
 * Function used to load Node-based Monkei-Cord modification (packaged in ASAR format).
 * 
 * This has some advantages over Chrome extensions – it allows developers to use
 * various packages as dependencies from Node registry, providing a way of doing
 * more complex modifications. In the future, these format may allow injecting the
 * code as a part of `main` process, providing even more control to developers to
 * mod the application.
 * 
 * Currently, it allows for CSS modifications via `webcord.css` property in
 * `package.json` – it should point to the path containing your CSS tweaks.
 * 
 * @param window Electron's `BrowserWindow` object.
 */
export async function loadNodeAddons(window: BrowserWindow): Promise<void> {
    const strings = (new l10n()).strings;
    const files = dialog.showOpenDialogSync({
        title: strings.menubar.file.addon.loadNode,
        filters: [
            { name: strings.dialog.mod.nodeExt, extensions: ["asar"] }
        ]
    });
    console.log(files);
    if (files === undefined) return;
    for (const file of files) {
        const modJson = JSON.parse(fs.readFileSync(file + "/package.json", 'utf-8'));
        if (modJson === undefined) return;
        const modInfo = {
            name: modJson.productName || modJson.name,
            icon: path.join(file + '/' + modJson.webcord.icon),
            css: path.join(file + '/' + modJson.webcord.css),
            preload: path.join(file + '/' + modJson.webcord.preload)
        };
        console.log('CSS: ' + fs.existsSync(modInfo.css));
        console.log('Preload: ' + fs.existsSync(modInfo.preload));
        if (!fs.existsSync(modInfo.preload) && !fs.existsSync(modInfo.css)) {
            console.error("Failed on loading extension!");
            return;
        }
        if(modInfo.name)
        app.setName(app.getName() + ' (' + modInfo.name + ')');
        if (fs.existsSync(modInfo.icon)) window.setIcon(modInfo.icon);
        if (fs.existsSync(modInfo.css)) {
            window.webContents.insertCSS(fs.readFileSync(modInfo.css, 'utf-8'));
            fs.readFileSync(modInfo.css, 'utf-8');
        }
    }
}

export async function loadChromeAddons(window: BrowserWindow): Promise<void> {
    const strings = (new l10n()).strings;
    const session = window.webContents.session;
    const files = dialog.showOpenDialogSync({
        title: strings.menubar.file.addon.loadChrome,
        filters: [
            { name: strings.dialog.mod.crx, extensions: ["crx"] }
        ]
    });
    if (files === undefined) return;
    for (const file of files) session.loadExtension(file);
}
