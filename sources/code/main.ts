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

import('./modules/error').then(eHand => eHand.default());

// Optional debug logging implementation by overwritting the global `console` method.
console.debug = function (message?, ...optionalParams) {
    import('electron').then(e => e.app.commandLine.hasSwitch).then(hasSwitch => {
        import('colors/safe').then(colors => {
            if (hasSwitch('verbose')||hasSwitch('v'))
                console.log(colors.gray(message), ...optionalParams)
        })
    }) 
}

import { app, BrowserWindow, dialog, shell } from 'electron';
import { promises as fs } from 'fs';
import { trustedProtocolArray } from './global';
import { checkVersion } from './main/modules/update';
import l10n from './modules/l10n';
import createMainWindow from "./main/windows/main";
import setAboutPanel from "./main/windows/about";
import { AppConfig } from './main/modules/config';
import * as colors from 'colors/safe';
import { resolve as resolvePath, relative } from 'path';

// Handle command line switches:

/** Whenever `--start-minimized` or `-m` switch is used when running client. */
let startHidden = false;
let overwriteMain: (() => void | unknown) | undefined;

{
    const renderLine = (parameter:string, description:string, length?:number) => {
        const spaceBetween = (length ?? 30) - parameter.length;
        return '  '+colors.green(parameter)+' '.repeat(spaceBetween)+colors.gray(description)+'\n'
    }
    const { hasSwitch, getSwitchValue } = app.commandLine;
    if (hasSwitch('help') || hasSwitch('h')) {
        console.log(
            "\n " + colors.bold(colors.blue(app.getName())) +
            " – Privacy focused Discord client made with " + colors.bold(colors.white(colors.bgBlue("TypeScript"))) + " and " + colors.bold(colors.bgBlack(colors.cyan("Electron"))) + '.\n\n' +
            " " + colors.underline("Usage:") + " " + colors.red(process.argv0) + colors.green(" [option]\n\n") +
            " " + colors.underline("Options:") + "\n" +
            renderLine('--version  -V','Show current application version.')+
            renderLine('--start-minimized  -m','Hide application at first run.') +
            renderLine('--export-l10n'+ '=' + colors.yellow('{dir}'), '          Export currently loaded translation files from') +
            " ".repeat(32)+colors.gray("the application to the " + colors.yellow('{dir}') + " directory.\n")+
            renderLine('--verbose  -v', "Show debug messages.")
        );
        app.exit();
    }
    if (hasSwitch('version') || hasSwitch('V')) {
        console.log(app.getName() + ' v' + app.getVersion());
        app.exit();
    }
    if (hasSwitch('start-minimized') || hasSwitch('m'))
        startHidden = true;
    if (hasSwitch('export-l10n')) {
        overwriteMain = () => {
            const locale = new l10n;
            const directory = getSwitchValue('export-l10n');
            const filePromise: Promise<void>[] = [];
            for (const file in locale)
                filePromise.push(
                    fs.writeFile(resolvePath(directory, file + '.json'),JSON.stringify(locale[file as keyof typeof locale], null, 2))
                );
            Promise.all(filePromise).then(() => {
                console.log(
                    "\n🎉️ Successfully exported localization files to \n" +
                    "   '" + directory + "'!\n"
                );
                app.quit();
            }).catch((err:NodeJS.ErrnoException) => {
                console.error(
                    '\n⛔️ ' + colors.red(colors.bold(err.code || err.name)) + ' ' + err.syscall + ': ' +
                        (err.path ? colors.blue(colors.underline(relative(process.cwd(),err.path))) + ': ' : '') +
                        err.message.replace(err.code + ': ', '')
                            .replace(', ' + err.syscall + " '" + err.path + "'", '') + '.\n'
                );
                app.exit((err.errno??0)*(-1));
            });
        };
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
        mainWindow = createMainWindow(startHidden, l10nStrings);
        setAboutPanel(l10nStrings);
    }
}

if (!singleInstance && !overwriteMain) {
    app.on('ready', () => {
        console.log((new l10n()).client.misc.singleInstance);
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
        if (!app.isReady()) return { action: 'deny' };
        const openUrl = new URL(details.url);
        const sameOrigin = new URL(webContents.getURL()).origin === openUrl.origin;
        let allowedProtocol = false;

        // Check if protocol of `openUrl` is secure.
        if (trustedProtocolArray.includes(openUrl.protocol))
            allowedProtocol = true;

        /* 
         * If origins of `openUrl` and current webContents URL are different,
         * ask the end user to confirm if the URL is safe enough for him.
         * (unless an application user disabled that functionality)
         */
        if (allowedProtocol && !sameOrigin && new AppConfig().get().redirectionWarning || !(new URL(webContents.getURL()).origin === 'https://discord.com')) {
            const window = BrowserWindow.fromWebContents(webContents);
            const strings = (new l10n).client.dialog;
            const options: Electron.MessageBoxSyncOptions = {
                type: 'warning',
                title: strings.common.warning + ': ' + strings.externalApp.title,
                message: strings.externalApp.message,
                buttons: [strings.common.yes, strings.common.no],
                defaultId: 1,
                cancelId: 1,
                detail: strings.common.source + ':\n' + details.url,
                textWidth: 320,
                normalizeAccessKeys: true
            };
            let result: number;

            if (window)
                result = dialog.showMessageBoxSync(window, options);
            else
                result = dialog.showMessageBoxSync(options);

            if (result === 1) return { action: 'deny' };
        }
        if (allowedProtocol) shell.openExternal(details.url);
        return { action: 'deny' };
    });
});