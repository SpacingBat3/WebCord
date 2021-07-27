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

// Electron API and other node modules.

import {
    app,
    BrowserWindow,
    shell,
    Tray,
    screen
} from 'electron';

// Handle command line switches:

/** Whenever `--start-minimized` or `-m` switch is used when running client. */
let startHidden = false;
{
    const { hasSwitch } = app.commandLine
    if (hasSwitch('version')||hasSwitch('v')) {
        console.log(app.getName() + ' v' + app.getVersion());
        app.exit();
    } else if (hasSwitch('start-minimized')||hasSwitch('m')) {
        startHidden = true
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
    guessDevel,
    configData,
    winStorage,
    appConfig
} from './mainGlobal';

import { packageJson } from './global';
import { discordContentSecurityPolicy } from './csp'

// Check if we are using the packaged version:

const { devel, devFlag } = guessDevel();

// Load scripts:

import { checkVersion } from './update';
import { getUserAgent } from './userAgent';
import * as getMenu from './menus';
import { discordFavicons } from './favicons';
import { TranslatedStrings } from './lang';

// Removes deprecated config properties (if they exists)

const deprecated = ["csp.strict", "windowState", "css1Key"];
appConfig.deleteBulk(deprecated);


// "About" information
const appVersion: string = app.getVersion();
const appAuthor: string = packageJson.author.name;
const appYear = '2020'; // the year since this app exists
const updateYear = '2021'; // the year when the last update got released
const appRepo: string = packageJson.homepage;
const chromiumVersion: string = process.versions.chrome;


/*
 * Remember to add yourself to the contributors array in the package.json
 * if you're improving the code of this application
 */

 //console.log(packageJson)
 //console.log(packageJson.contributors)

//let appContributors: Array<string> = [appAuthor + packageJson.contrib.authors];
let appContributors: Array<string> = [ appAuthor, ...packageJson.contributors ];

// Hence GTK allows for tags there on Linux, generate links to website/email
if (process.platform === "linux") {

    if (packageJson.author.url)
        appContributors = ['<a href="' + packageJson.author.url + '">' + appAuthor + '</a>'];

    else if (packageJson.author.email)
        appContributors = ['<a href="mailto:' + packageJson.author.email + '">' + appAuthor + '</a>'];

}

if (Array.isArray(packageJson.contributors) && packageJson.contributors.length > 0) {
    for (let n = 0; n < packageJson.contributors.length; n++) {
        // Guess "person" format:
        if (packageJson.contributors[n].name) {
            if (process.platform == "linux") {
                const { name, email, url } = packageJson.contributors[n];
                let linkTag = "", linkTagClose = "";
                if (url) {
                    linkTag = '<a href="' + url + '">';
                } else if (email) {
                    linkTag = '<a href="mailto:' + email + '">';
                }
                if (linkTag !== "") linkTagClose = "</a>";
                appContributors.push(linkTag + name + linkTagClose);
            } else {
                appContributors.push(packageJson.contributors[n].name);
            }
        } else {
            appContributors.push(packageJson.contributors[n]);
        }
    }
}

// "Dynamic" variables that shouldn't be changed:

const stringContributors = appContributors.join(', ');
const singleInstance = app.requestSingleInstanceLock();
let mainWindow: BrowserWindow, winHeight: number, winWidth: number;
let tray: Promise<Tray>, l10nStrings: TranslatedStrings, updateInterval: NodeJS.Timeout | undefined;

// Year format for the copyright

const copyYear = appYear + '-' + updateYear;

// Fake Chromium User Agent:

const fakeUserAgent = getUserAgent(chromiumVersion);

// "About" Panel:

function aboutPanel(): void {
    let iconPath: string;
    if (fs.existsSync(appInfo.icon)) {
        iconPath = appInfo.icon;
    } else {
        iconPath = '/usr/share/icons/hicolor/512x512/apps/' + packageJson.name + '.png';
    }
    const aboutVersions = "Electron: " + process.versions.electron + "    Node: " + process.versions.node + "    Chromium: " + process.versions.chrome;
    app.setAboutPanelOptions({
        applicationName: app.getName(),
        applicationVersion: `v${appVersion}${devFlag}`,
        authors: appContributors,
        website: appRepo,
        credits: `${l10nStrings.help.contributors} ${stringContributors}`,
        copyright: `Copyright © ${copyYear} ${appAuthor}\n\n${l10nStrings.help.credits}\n\n${aboutVersions}`,
        iconPath: iconPath
    });
}

function createWindow(): BrowserWindow {

    // Check the window state

    const mainWindowState = windowStateKeeper('win');

    // Browser window

    const win = new BrowserWindow({
        title: app.getName(),
        minWidth: appInfo.minWinWidth,
        minHeight: appInfo.minWinHeight,
        height: mainWindowState.height,
        width: mainWindowState.width,
        backgroundColor: "#2F3136",
        icon: appInfo.icon,
        show: !startHidden,
        webPreferences: {
            enableRemoteModule: false,
            nodeIntegration: false, // Won't work with the true value.
            devTools: true, // Too usefull to be blocked.
            contextIsolation: false // Disabled because of the capturer.
        }
    });

    //SplashWindow
    const SplashWindow = new BrowserWindow({
        title: app.getName(),
        width: 350,
        height: 350,
        frame: false,
        transparent: false,
        center: true,
        backgroundColor: "#2F3136",
        icon: appInfo.icon,
        show: !startHidden,
        webPreferences: {
            enableRemoteModule: false,
            nodeIntegration: false, // Won't work with the true value.
            devTools: true, // Too usefull to be blocked.
            contextIsolation: false // Disabled because of the capturer.
        }
    });

    // Preload scripts:

    win.webContents.session.setPreloads([
        app.getAppPath() + "/sources/app/renderer/capturer.js",
        app.getAppPath() + "/sources/app/renderer/cosmetic.js"
    ]);

    // CSP

    if (!configData.csp.disabled) {
        win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [discordContentSecurityPolicy]
                }
            });
        });
    }
    const childCsp = "default-src 'self' blob:";

    // Permissions:
    {
        /** List of domains, urls or protocols accepted by permission handlers. */
        const trustedURLs = [
            appInfo.rootURL,
            'devtools://'
        ]
        win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
            let websiteURL:string;
            (webContents!==null&&webContents.getURL()!=="") ? websiteURL = webContents.getURL() : websiteURL = requestingOrigin;
            // In some cases URL might be empty string, it should be denied then for that reason.
            if(websiteURL==="")
                return false;
            const originURL = new URL(websiteURL).origin;
            for(const secureURL of trustedURLs) {
                if (originURL.startsWith(secureURL)) {
                    return true;
                }
            }
            console.warn(`[${l10nStrings.dialog.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.check.denied}`, originURL, permission);
            return false;
        });
        win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
            for(const secureURL of trustedURLs) {
                if (webContents.getURL().startsWith(secureURL)) {
                    return callback(true);
                }
            }
            console.warn(`[${l10nStrings.dialog.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.request.denied}`, webContents.getURL(), permission);
            return callback(false);
        });
    }
    SplashWindow.loadFile("sources/splash.html")
    SplashWindow.show();
    win.hide();
    win.loadURL(appInfo.URL, { userAgent: fakeUserAgent });
    win.setAutoHideMenuBar(configData.hideMenuBar);
    win.setMenuBarVisibility(!configData.hideMenuBar);
    mainWindowState.track(win);

    // Load all menus:

    getMenu.context(win);
    if (!configData.disableTray) tray = getMenu.tray(win, childCsp);
    getMenu.bar(packageJson.repository.url, win);

    // Open external URLs in default browser
    {
        win.webContents.setWindowOpenHandler((details) => {
            /**
             * Allowed protocol list.
             *
             * For security reasons, `shell.openExternal()` should not be used for any type
             * of the link, as this may allow potential attackers to compromise host or even
             * execute arbitary commands.
             *
             * See:
             * https://www.electronjs.org/docs/tutorial/security#14-do-not-use-openexternal-with-untrusted-content
             */
            const trustedProtocolArray = [
                'https://',
                'mailto:'
            ]
            for(const protocol of trustedProtocolArray) {
                if(details.url.startsWith(protocol)) shell.openExternal(details.url);
            }
            return { action: 'deny' };
        });
    }

    // "Red dot" icon feature

    win.webContents.once('did-finish-load', () => {
        setTimeout(function () {
          win.show();
          SplashWindow.close();
        }, 3000)
        win.webContents.on('page-favicon-updated', async (event,favicons) => {
            const t = await tray;
            if(!configData.disableTray) if(favicons[0] === discordFavicons.default || favicons[0] === discordFavicons.unread)
                t.setImage(appInfo.trayIcon);
            else
                t.setImage(appInfo.trayPing);
        });
    });

    // Window Title

    win.on('page-title-updated', (event: Event, title: string) => {
        if (title == "Discord") {
            event.preventDefault();
            win.setTitle(app.getName());
        }
    });

    // Animate menu

    win.webContents.on('did-finish-load', () => {
        win.webContents.insertCSS(".sidebar-2K8pFh{ transition: width .1s; transition-timing-function: linear;}");
    });

    return win;
}

// Remember window state

type windowStatus = {
    width: number;
    height: number;
    isMaximized?: boolean;
}

function windowStateKeeper(windowName: string) {

    let window: BrowserWindow, windowState: windowStatus;

    function setBounds(): windowStatus {
        let wS: windowStatus | undefined, wState: windowStatus;
        if (winStorage.has(`${windowName}`)) {
            wS = winStorage.get(`${windowName}`);
            if (wS === undefined) {
                wState = {
                    width: winWidth,
                    height: winHeight
                };
            } else {
                wState = wS;
            }
        } else {
            wState = {
                width: winWidth,
                height: winHeight
            };
        }
        return wState;
    }

    function saveState(): void {
        if (!windowState.isMaximized) {
            windowState = window.getBounds();
        }
        windowState.isMaximized = window.isMaximized();
        winStorage.set(`${windowName}`, windowState);
    }

    function track(win: BrowserWindow): void {
        window = win;
        win.on('resize', saveState);
        win.on('close', saveState);
    }
    windowState = setBounds();
    return ({
        width: windowState.width,
        height: windowState.height,
        isMaximized: windowState.isMaximized,
        track
    });
}

function main(): void {
    /* MainFunc */
    winWidth = appInfo.minWinWidth + (screen.getPrimaryDisplay().workAreaSize.width / 3);
    winHeight = appInfo.minWinHeight + (screen.getPrimaryDisplay().workAreaSize.height / 3);
    l10nStrings = new TranslatedStrings();
    checkVersion(l10nStrings, devel, appInfo.icon, updateInterval);
    updateInterval = setInterval(function () { checkVersion(l10nStrings, devel, appInfo.icon, updateInterval); }, 1800000);
    mainWindow = createWindow();
    aboutPanel();
}

if (!singleInstance) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (app.isReady()) console.log((new TranslatedStrings()).misc.singleInstance);
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
