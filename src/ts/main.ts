/*
 * Main process script (main.ts)
 */
 
// Load the stuff we need to have there:

import { app, BrowserWindow, shell } from 'electron';
import { packageJson, configData } from './object.js'

import fs = require('fs');
import path = require('path');
import appConfig = require('electron-json-config');
import deepmerge = require('deepmerge');

/*
 * Get current app dir – also removes the need of importing icons
 * manually to the electron package dir.
 */

const appDir = app.getAppPath();

/*  
 * Check if we are using the packaged version.
 */

let devel, devFlag
if (appDir.indexOf(".asar") < 0) {
    devel = true;
    devFlag = " [DEV]"
} else {
    devel = false;
}

/*
 * "About" window icon doesn't work
 * (newer GTK versions don't have it anyway)
 */
const appIconDir = `${appDir}/icons`;

// Load scripts:
import {checkVersion} from './update.js'
import {getUserAgent} from './userAgent.js';
import * as getMenu from "./menus.js";

// Load string translations:

function loadTranslations() {
    let l10nStrings, localStrings;
    const systemLang = app.getLocale();
    /* eslint-disable */
    const globalStrings = require("../lang/en-GB/strings.json");
    localStrings = `src/lang/${systemLang}/strings.json`;
    if(fs.existsSync(path.join(appDir, localStrings))) {
        localStrings = require(`${appDir}/src/lang/${systemLang}/strings.json`);
        l10nStrings = deepmerge(globalStrings, localStrings);
    } else {
        l10nStrings = globalStrings; // Default lang to english
    }
    return l10nStrings;
}

// Vars to modify app behavior
const repoName = "SpacingBat3/electron-discord-webapp";
const appURL = 'https://discord.com/app';
const appIcon = `${appIconDir}/app.png`;
const appTrayIcon = `${appDir}/icons/tray.png`;
const appTrayPing = `${appDir}/icons/tray-ping.png`;
const appTrayIconSmall = `${appDir}/icons/tray-small.png`;
const winWidth = 1000;
const winHeight = 600;

// "About" information
const appFullName = app.getName()
const appVersion = packageJson.version;
const appAuthor = packageJson.author.name;
const appYear = '2020'; // the year since this app exists
const updateYear = '2021'; // the year when the last update got released
const appRepo = packageJson.homepage;
const chromiumVersion = process.versions.chrome;


/*
 * Remember to add yourself to the contributors array in the package.json
 * if you're improving the code of this application
 */
/*if (Array.isArray(packageJson.contributors) && packageJson.contributors.length) {
    appContributors = [ appAuthor, ...packageJson.contributors ];
} else {*/
    const appContributors = [ appAuthor ];
//}

// "Dynamic" variables that shouldn't be changed:

const stringContributors = appContributors.join(', ');
const singleInstance = app.requestSingleInstanceLock();
let mainWindow
let tray, l10nStrings, updateInterval;

/*
 * Migrate old config dir to the new one.
 * This option exist because of the compability reasons 
 * with v0.1.X versions of this script
 */

const oldUserPath = path.join(app.getPath('userData'), '..', packageJson.name);
if(fs.existsSync(oldUserPath)) {
    fs.rmdirSync(app.getPath('userData'), { recursive: true });
    fs.renameSync(oldUserPath, app.getPath('userData'));
}

// Year format for the copyright

const copyYear = `${appYear}-${updateYear}`;

// Fake Chromium User Agent:

const fakeUserAgent = getUserAgent(chromiumVersion);

// "About" Panel:

function aboutPanel() {
    const aboutWindow = app.setAboutPanelOptions({
        applicationName: appFullName,
        applicationVersion: `v${appVersion} (Electron v${process.versions.electron})${devFlag}`,
        authors: appContributors,
        website: appRepo,
        credits: `${l10nStrings.help.contributors} ${stringContributors}`,
        copyright: `Copyright © ${copyYear} ${appAuthor}\n\n${l10nStrings.help.credits}`,
        iconPath: appIcon
    });
    return aboutWindow;
}

function createWindow() {

    // Check the window state

    const mainWindowState = windowStateKeeper('win');

    // Browser window
    
    const win = new BrowserWindow({
        title: appFullName,
        minWidth: 312,
        minHeight: 412,
        height: mainWindowState.height,
        width: mainWindowState.width,
        backgroundColor: "#2F3136",
        icon: appIcon,
        webPreferences: {
            nodeIntegration: false, // Won't work with the true value.
            devTools: devel,
            contextIsolation: false // Disabled because of the capturer.
        }
    });

    // Preload scripts:

    win.webContents.session.setPreloads([
        `${appDir}/src/js/preload-capturer.js`
    ])
    
    // Permissions:
    
    win.webContents.session.setPermissionCheckHandler( (webContents, permission) => {
        if(webContents.getURL().includes('https://discord.com')){
            return true;
        } else {
            console.warn(`[${l10nStrings.dialog.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.check.denied}`, webContents.getURL(), permission);
            return false;
        }
    });
    win.webContents.session.setPermissionRequestHandler( (webContents, permission, callback) => {
        if(webContents.getURL().includes('https://discord.com')){
            return callback(true);
        } else {
            console.warn(`[${l10nStrings.dialog.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.request.denied}`, webContents.getURL(), permission);
            return callback(false);
        }
    });

    win.loadURL(appURL,{userAgent: fakeUserAgent});
    win.setAutoHideMenuBar(configData.hideMenuBar);
    win.setMenuBarVisibility(!configData.hideMenuBar);
    mainWindowState.track(win);

    // Load all menus:

    getMenu.context(win, l10nStrings);
    if(!configData.disableTray) tray = getMenu.tray(appTrayIcon, appTrayIconSmall, win, l10nStrings);
    getMenu.bar(packageJson.repository.url, win, l10nStrings);

    // Open external URLs in default browser

    win.webContents.on('new-window', (event, externalURL) => {
        event.preventDefault();
        shell.openExternal(externalURL);
    });

    // "Red dot" icon feature

    win.webContents.once('did-finish-load', () => {
        setTimeout(function(){
            win.webContents.on('page-favicon-updated', () => {
                if(!win.isFocused() && !configData.disableTray) tray.setImage(appTrayPing);
        })}, 1000);

        app.on('browser-window-focus', () => {
            if(!configData.disableTray) tray.setImage(appTrayIcon);
        });
    
        /* 
         * Hideable animated side bar:
         * (and now it isn't "dirty"!)
         */

        if (appConfig.has('mobileMode') && appConfig.get('mobileMode')) async () => {
            const key = await win.webContents.insertCSS(".sidebar-2K8pFh{ width: 0px !important; }");
            appConfig.set('css1Key',key);
        }

        // Animate menu
        
        win.webContents.insertCSS(".sidebar-2K8pFh{ transition: width 1s; transition-timing-function: ease;}");
    });
    return win;
}

// Remember window state

function windowStateKeeper(windowName) {
    let window, windowState, eventList;
    function setBounds() {

        // Restore from appConfig

        if (appConfig.has(`windowState.${windowName}`)) {
            windowState = appConfig.get(`windowState.${windowName}`);
            return;
        }

        // Default

        windowState = {
            width: winWidth,
            height: winHeight
        };
    }
    function saveState() {
        if (!windowState.isMaximized) {
            windowState = window.getBounds();
        }
        windowState.isMaximized = window.isMaximized();
        appConfig.set(`windowState.${windowName}`, windowState);
    }
    function track(win) {
        window = win;
        eventList = ['resize', 'close'];
        for (let i = 0, len = eventList.length; i < len; i++) {
            win.on(eventList[i], saveState);
        }
    }
    setBounds();
    return({
        width: windowState.width,
        height: windowState.height,
        isMaximized: windowState.isMaximized,
        track
    });
}

function main() {
    l10nStrings = loadTranslations();
    checkVersion(l10nStrings, devel, repoName, appIcon, updateInterval);
    updateInterval = setInterval(function(){checkVersion(l10nStrings, devel, repoName, appIcon, updateInterval)}, 1800000);
    mainWindow = createWindow();
    aboutPanel();
}

if (!singleInstance) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow){
            if(!mainWindow.isVisible()) mainWindow.show();
            if(mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
    app.on('ready', main);
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) main();
});
