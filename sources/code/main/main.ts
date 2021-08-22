/*
 * Main process script (main.ts)
 */

/*
 * Handle source maps.
 * This module will provide more readable crash output.
 * 
 * It is good idea to load it first to maximize the chance
 * it will load before Electron will print any error.
 */

import * as srcMap from 'source-map-support';
srcMap.install();

/**
 * Handle "crashes".
 * 
 * This module should be loaded and initalized before
 * any other part of the code is executed (to maximize
 * the chance WebCord errors will be properly handled)
 * and after source map support (as source map support
 * is less likely to to crash while offering more usefull
 * information).
 */

import crashHandler from '../internalModules/crashHandler';

crashHandler()

// Electron API and other node modules.

import {
    app,
    BrowserWindow
} from 'electron';

// Handle command line switches:

/** Whenever `--start-minimized` or `-m` switch is used when running client. */
let startHidden = false;
{
    const { hasSwitch } = app.commandLine;
    if (hasSwitch('version') || hasSwitch('v')) {
        console.log(app.getName() + ' v' + app.getVersion());
        app.exit();
    } else if (hasSwitch('start-minimized') || hasSwitch('m')) {
        startHidden = true;
    }
}

import * as fs from 'fs';
import * as path from 'path';

/*
 * Migrate old config dir to the new one.
 */
{
    const oldUserPath = path.join(app.getPath('userData'), '..', "Electron Discord Web App");
    if (fs.existsSync(oldUserPath)) {
        fs.rmSync(app.getPath('userData'), { recursive: true });
        fs.renameSync(oldUserPath, app.getPath('userData'));
    }
}

// Import functions/types/variables declarations:

import {
    appInfo,
    guessDevel
} from './properties';


// Check if we are using the packaged version:

const { devel } = guessDevel();

// Load scripts:

import { checkVersion } from './update';
import TranslatedStrings from './lang';

// Removes deprecated config properties (TODO)

/*const deprecated = ["csp.strict", "windowState", "css1Key"];
appConfig.deleteBulk(deprecated);*/

// Import windows declarations

import createMainWindow from "./windows/mainWindow"
import setAboutPanel from "./windows/aboutPanel"


// "Dynamic" variables that shouldn't be changed:


const singleInstance = app.requestSingleInstanceLock();
let mainWindow: BrowserWindow;
let l10nStrings: TranslatedStrings, updateInterval: NodeJS.Timeout | undefined;

function main(): void {
    l10nStrings = new TranslatedStrings();
    checkVersion(l10nStrings, devel, appInfo.icon, updateInterval);
    updateInterval = setInterval(function () { checkVersion(l10nStrings, devel, appInfo.icon, updateInterval); }, 1800000);
    mainWindow = createMainWindow(startHidden,l10nStrings);
    setAboutPanel(l10nStrings);
}

if (!singleInstance) {
    app.on('ready', () => {
        console.log((new TranslatedStrings()).misc.singleInstance)
        app.quit();
    });
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (!mainWindow.isVisible()) mainWindow.show();
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
    app.on('ready', main);
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) main();
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});