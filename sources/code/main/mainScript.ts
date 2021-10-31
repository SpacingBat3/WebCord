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

import { app, BrowserWindow, dialog, shell } from 'electron';
import { writeFile } from 'fs';
import { trustedProtocolArray } from '../global';
import { checkVersion } from './updateNotifier';
import l10n from '../modules/l10nSupport';
import createMainWindow from "./windows/mainWindow";
import setAboutPanel from "./windows/aboutPanel";

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
            writeFile(file,JSON.stringify(locale.client, null, 2), (err) => {
                if(err)
                    // An approach to make errors look more user-friendly.
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
let l10nStrings: l10n["client"], updateInterval: NodeJS.Timeout | undefined;

function main(): void {
    if (overwriteMain) {
        // Execute flag-specific function for ready application.
        overwriteMain();
    } else {
        // Run app normally
        l10nStrings = (new l10n()).client;
        checkVersion(updateInterval);
        updateInterval = setInterval(function () { checkVersion(updateInterval); }, 1800000);
        mainWindow = createMainWindow(startHidden,l10nStrings);
        setAboutPanel(l10nStrings);
    }
}

if (!singleInstance) {
    app.on('ready', () => {
        console.log((new l10n()).client.misc.singleInstance)
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

// Global `webContents` defaults for hardened security
app.on('web-contents-created', (_event, webContents) => {

    // Block navigation to the different origin.
    webContents.on('will-navigate', (event, url) => {
        const originUrl = webContents.getURL();
        if ((new URL(originUrl)).origin !== (new URL(url)).origin)
            event.preventDefault();
    });

    // Securely open some urls in external software.
    webContents.setWindowOpenHandler((details) => {
        if(!app.isReady()) return { action: 'deny' };
        const openUrl = new URL(details.url);
        const sameOrigin = new URL(webContents.getURL()).origin === openUrl.origin;
        let allowedProtocol = false;

        // Check if protocol of `openUrl` is secure.
        if (trustedProtocolArray.includes(openUrl.protocol))
                allowedProtocol = true;
        
        /* 
         * If origins of `openUrl` and current webContents URL are different,
         * ask the end user to confirm if the URL is safe enough for him.
         */
        if(allowedProtocol === true && sameOrigin === false) {
            const window = BrowserWindow.fromWebContents(webContents);
            const strings = (new l10n).client.dialog;
            const options:Electron.MessageBoxSyncOptions = {
                type: 'warning',
                title: strings.common.warning+': '+strings.externalApp.title,
                message: strings.externalApp.message,
                buttons: [strings.common.yes, strings.common.no],
                defaultId: 1,
                cancelId: 1,
                detail: strings.common.source+':\n'+details.url,
                textWidth:320,
                normalizeAccessKeys: true
            }
            let result:number;

            if(window)
                result = dialog.showMessageBoxSync(window,options);
            else
                result = dialog.showMessageBoxSync(options);
            
            if(result === 1) return { action: 'deny' };
        }
        if(allowedProtocol) shell.openExternal(details.url);
        return { action: 'deny' };
    });
});