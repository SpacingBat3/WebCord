/*
 * mainScript – used for app args handling and importing all other scripts
 *              into one place.
 */

interface peacenotwarModule {
	whatWeWant: string;
}

eval("import(\"peacenotwar\")").then((peacenotwar : peacenotwarModule) => {
	console.log(peacenotwar.whatWeWant);
});

/*
 * Handle source maps.
 * This module will provide more readable crash output.
 * 
 * It is good idea to load it first to maximize the chance
 * it will load before Electron will print any error.
 */
import { install } from 'source-map-support';
install();
/*
 * Handle "crashes".
 * 
 * This module should be loaded and initalized before
 * any other part of the code is executed (to maximize
 * the chance WebCord errors will be properly handled)
 * and after source map support (as source map support
 * is less likely to to crash while offering more usefull
 * information).
 */

import crash, {commonCatches} from '../main/modules/error';
crash();

// Optional debug logging implementation by overwritting the global `console` method.
console.debug = function (message?:unknown, ...optionalParams:unknown[]) {
    Promise.all([import('electron'),import('@spacingbat3/kolor')])
        .then(([Electron,colors]) => [Electron.app.commandLine, colors.default] as [Electron.CommandLine, typeof colors.default])
        .then(([cmd,colors]) => {
            if (cmd.hasSwitch('verbose')||cmd.hasSwitch('v'))
                if(typeof message === "string")
                    console.log(colors.gray(message), ...optionalParams)
                else
                    console.log(message, ...optionalParams)
    }).catch(commonCatches.print)
}

// Colorize output on errors/warnings
{
    const stdErr = console.error
    const stdWarn = console.warn
    console.error = function (message?:unknown, ...optionalParams:unknown[]) {
        import('@spacingbat3/kolor').then(colors => colors.default).then(colors => {
            if(typeof message === "string")
                stdErr(colors.red(message), ...optionalParams)
            else
                stdErr(message, ...optionalParams)
        }).catch(commonCatches.print)
    }
    console.warn = function (message?, ...optionalParams:unknown[]) {
        import('@spacingbat3/kolor').then(colors => colors.default).then(colors => {
            if(typeof message === "string")
                stdWarn(colors.yellow(message), ...optionalParams)
            else
                stdWarn(message, ...optionalParams)
        }).catch(commonCatches.print)
    }
}
import { app, BrowserWindow, dialog, session, shell } from 'electron';
import { promises as fs } from 'fs';
import { trustedProtocolRegExp, SessionLatest, knownInstancesList } from './global';
import { checkVersion } from '../main/modules/update';
import l10n from './modules/l10n';
import createMainWindow from "../main/windows/main";
import { AppConfig } from '../main/modules/config';
import colors from '@spacingbat3/kolor';
import { resolve as resolvePath, relative } from 'path';
import { major } from "semver";
import { getUserAgent } from './modules/agent';
import { getBuildInfo } from '../main/modules/client';

// Set global user agent
app.userAgentFallback = getUserAgent(process.versions.chrome);

// Handle command line switches:

/** Whenever `--start-minimized` or `-m` switch is used when running client. */
let startHidden = false;
let overwriteMain: (() => void | unknown) | undefined;

{
    const renderLine = (parameter:string, description:string, length?:number) => {
        // eslint-disable-next-line no-control-regex
        const spaceBetween = (length ?? 30) - parameter.replace(/\x1B\[[^m]+m/g, '').length;
        return '  '+colors.green(parameter)+' '.repeat(spaceBetween)+colors.gray(description)+'\n'
    }
    const cmd = app.commandLine;

    // Mitigations to *unsafe* command-line switches
    if (getBuildInfo().type !== "devel")
        for(const cmdSwitch of [
            "inspect-brk",
            "inspect-port",
            "inspect",
            "inspect-publish-uid"
        ]) if(cmd.hasSwitch(cmdSwitch))
            cmd.removeSwitch(cmdSwitch);

    if (cmd.hasSwitch('help') || cmd.hasSwitch('h')) {
        console.log(
            "\n " + colors.bold(colors.blue(app.getName())) +
            " – Privacy focused Discord client made with " + colors.bold(colors.white(colors.blueBg("TypeScript"))) + " and " + colors.bold(colors.blackBg(colors.cyan("Electron"))) + '.\n\n' +
            " " + colors.underscore("Usage:") + " " + colors.red(process.argv0) + colors.green(" [option]\n\n") +
            " " + colors.underscore("Options:") + "\n" +
            renderLine('--version  -V','Show current application version.')+
            renderLine('--start-minimized  -m','Hide application at first run.') +
            renderLine('--export-l10n'+ '=' + colors.yellow('{dir}'), 'Export currently loaded translation files from') +
            " ".repeat(32)+colors.gray("the application to the " + colors.yellow('{dir}') + " directory.\n")+
            renderLine('--verbose  -v', "Show debug messages.")
        );
        app.exit();
    }
    if (cmd.hasSwitch('version') || cmd.hasSwitch('V')) {
        console.log(app.getName() + ' v' + app.getVersion());
        app.exit();
    }
    if (cmd.hasSwitch('start-minimized') || cmd.hasSwitch('m'))
        startHidden = true;
    if (cmd.hasSwitch('export-l10n')) {
        overwriteMain = () => {
            const locale = new l10n;
            const directory = cmd.getSwitchValue('export-l10n');
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
                    '\n⛔️ ' + colors.red(colors.bold(err.code ?? err.name)) + ' ' + (err.syscall ?? "") + ': ' +
                        (err.path ? colors.blue(colors.underscore(relative(process.cwd(),err.path))) + ': ' : '') +
                        err.message.replace((err.code ?? '') + ': ', '')
                            .replace(', ' + (err.syscall ?? '') + " '" + (err.path ?? '') + "'", '') + '.\n'
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
        checkVersion(updateInterval).catch(commonCatches.print);
        updateInterval = setInterval(function () { checkVersion(updateInterval).catch(commonCatches.print); }, 1800000);
        mainWindow = createMainWindow(startHidden, l10nStrings);
    }
}

if (!singleInstance && !overwriteMain) {
    app.on('ready', () => {
        console.log((new l10n()).client.log.singleInstance);
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
    const isMainWindow = webContents.session === session.defaultSession;
    // Block all permission requests/checks by the default.
    if(!isMainWindow){
        webContents.session.setPermissionCheckHandler(() => false);
        webContents.session.setPermissionRequestHandler((_webContents,_permission,callback) => callback(false));
    }
    // Block HID request only when Electron supports handling them.
    if(major(process.versions.electron) >= 16 || /^(?:14|15)\.1\.\d+.*$/.test(process.versions.electron))
        (webContents.session as SessionLatest).setDevicePermissionHandler(() => false);
    // Block navigation to the different origin.
    webContents.on('will-navigate', (event, url) => {
        const originUrl = webContents.getURL();
        if (originUrl !== '' && (new URL(originUrl)).origin !== (new URL(url)).origin)
            event.preventDefault();
    });

    // Securely open some urls in external software.
    webContents.setWindowOpenHandler((details) => {
        const config = new AppConfig().get()
        if (!app.isReady()) return { action: 'deny' };
        const openUrl = new URL(details.url);
        const sameOrigin = new URL(webContents.getURL()).origin === openUrl.origin;
        let allowedProtocol = false;

        // Check if protocol of `openUrl` is secure.
        if (openUrl.protocol.match(trustedProtocolRegExp))
            allowedProtocol = true;

        /* 
         * If origins of `openUrl` and current webContents URL are different,
         * ask the end user to confirm if the URL is safe enough for him.
         * (unless an application user disabled that functionality)
         */
        if (allowedProtocol && !sameOrigin && config.redirectionWarning || !isMainWindow) {
            const window = BrowserWindow.fromWebContents(webContents);
            const strings = (new l10n).client.dialog;
            const options: Electron.MessageBoxSyncOptions = {
                type: 'warning',
                title: strings.common.warning + ': ' + strings.externalApp.title,
                message: strings.externalApp.message,
                buttons: [strings.common.no, strings.common.yes],
                defaultId: 0,
                cancelId: 0,
                detail: strings.common.source + ':\n' + details.url,
                textWidth: 320,
                normalizeAccessKeys: true
            };
            let result: number;

            if (window instanceof BrowserWindow)
                result = dialog.showMessageBoxSync(window, options);
            else
                result = dialog.showMessageBoxSync(options);

            if (result === 0) return { action: 'deny' };
        }
        if (allowedProtocol) {
            const url = new URL(details.url);
            const window = BrowserWindow.fromWebContents(webContents);
            if(url.host === knownInstancesList[config.currentInstance][1].host && url.pathname === '/popout')
                return {
                    action: 'allow',
                    overrideBrowserWindowOptions: {
                        autoHideMenuBar: true,
                        ...(window ? {BrowserWindow: window} : {}),
                        fullscreenable: false // not functional with 'children'
                    }
                }
            else
                shell.openExternal(details.url).catch(commonCatches.print);
        }
        return { action: 'deny' };
    });

    // Remove menu from popups
    webContents.on("did-create-window", (window) => {
        window.removeMenu();
    });
});
