/*
 * mainScript – used for app args handling and importing all other scripts
 *              into one place.
 */

/*
 * Handle source maps.
 * This module will provide more readable crash output.
 * 
 * It is good idea to load it first to maximize the chance
 * it will load before Electron will print any error.
 */

import('source-map-support').then(sMap => sMap.install());

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

import('../modules/errorHandler').then(eHand => eHand.default());

import { app, BrowserWindow } from 'electron';
import { writeFile } from 'fs';

import { checkVersion } from './updateNotifier';
import l10n from './l10nSupport';
import createMainWindow from "./windows/mainWindow"
import setAboutPanel from "./windows/aboutPanel"

// Handle command line switches:

/** Whenever `--start-minimized` or `-m` switch is used when running client. */
let startHidden = false;
let overwriteMain: (()=>void|unknown) | undefined;
{
    const { hasSwitch, getSwitchValue } = app.commandLine;
    if (hasSwitch('version') || hasSwitch('v')) {
        console.log(app.getName() + ' v' + app.getVersion());
        app.exit();
    }
    if (hasSwitch('start-minimized') || hasSwitch('m'))
        startHidden = true;
    if (hasSwitch('export-strings')) {
        overwriteMain = () => {
            const locale = new l10n;
            const file = getSwitchValue('export-strings');
            writeFile(file,JSON.stringify(locale.strings, null, 2), (err) => {
                if(err)
                    // An approach to make errors more user-friendly.
                    console.error(
                        '\n⛔️ '+(err.code||err.name)+' '+err.syscall+': '+file+': '+
                        err.message.replace(err.code+': ','')
                            .replace(', '+err.syscall+" '"+err.path+"'",'')+'.\n'
                    );
                else
                    console.log(
                        "\n🎉️ Successfully exported language strings to \n"+
                        "   '"+file+"'!\n"
                    )
                app.quit();
            })
        }
    }
}

// Some variable declarations

const singleInstance = app.requestSingleInstanceLock();
let mainWindow: BrowserWindow;
let l10nStrings: l10n["strings"], updateInterval: NodeJS.Timeout | undefined;

function main(): void {
    if (overwriteMain) {
        // Execute flag-specific function for ready application.
        overwriteMain();
    } else {
        // Run app normally
        l10nStrings = (new l10n()).strings;
        checkVersion(updateInterval);
        updateInterval = setInterval(function () { checkVersion(updateInterval); }, 1800000);
        mainWindow = createMainWindow(startHidden,l10nStrings);
        setAboutPanel(l10nStrings);
    }
}

if (!singleInstance) {
    app.on('ready', () => {
        console.log((new l10n()).strings.misc.singleInstance)
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