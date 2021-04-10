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

/* eslint-disable */
require('source-map-support').install();

/*
 * Electron API and other node modules.
 */

import {
    app,
    BrowserWindow,
    shell,
    Tray,
    screen,
    nativeImage
} from 'electron';

import fs = require('fs');
import path = require('path');
import deepmerge = require('deepmerge');

/*
 * Migrate old config dir to the new one.
 */

const oldUserPath = path.join(app.getPath('userData'), '..', "Electron Discord Web App");
if(fs.existsSync(oldUserPath)) {
    fs.rmdirSync(app.getPath('userData'), { recursive: true });
    fs.renameSync(oldUserPath, app.getPath('userData'));
}

/*
 * Some types and JavaScript objects declarations.
 */
import {
    packageJson,
    configData,
    winStorage,
    appConfig,
    globalVars,
    lang
} from './object.js';

/*
 * Get current app dir – also removes the need of importing icons
 * manually to the electron package dir.
 */

const appDir = app.getAppPath();

/*  
 * Check if we are using the packaged version.
 */

let devel:boolean, devFlag:string, appIconDir:string;
if (appDir.indexOf(".asar") < 0) {
    devel = true;
    devFlag = " [DEV]";
    appIconDir = appDir + "/icons";
} else {
    devel = false;
    devFlag = "";
    appIconDir = path.join(appDir, "..");
}

// Load scripts:
import {checkVersion} from './update.js'
import {getUserAgent} from './userAgent.js';
import * as getMenu from './menus.js';

// Load string translations:

function loadTranslations():lang {
    let l10nStrings:lang, localStrings:lang;
    const systemLang:string = app.getLocale();
    l10nStrings = require("../lang/en-GB/strings.json"); // Default lang to english
    if(fs.existsSync(path.join(appDir, "src/lang/"+systemLang+"/strings.json"))) {
        localStrings = require(appDir+"/src/lang/"+systemLang+"/strings.json");
        l10nStrings = deepmerge(l10nStrings, localStrings);
    }
    return l10nStrings;
}

// Removes deprecated config properties (if they exists)

const deprecated = ["csp.strict","windowState","css1Key"];
appConfig.deleteBulk(deprecated);

// Vars to modify app behavior
const repoName = "SpacingBat3/WebCord";
const appRootURL = 'https://discord.com'
const appURL = appRootURL + '/app';
const appIcon = appIconDir + "/app.png";
const appTrayIcon = appDir + "/icons/tray.png";
const appTrayPing = appDir + "/icons/tray-ping.png";

const minWinWidth = 312;
const minWinHeight = 412;
let winWidth:number;
let winHeight:number;

// "About" information
const appFullName:string = app.getName()
const appVersion:string = packageJson.version;
const appAuthor:string = packageJson.author.name;
const appYear = '2020'; // the year since this app exists
const updateYear = '2021'; // the year when the last update got released
const appRepo:string = packageJson.homepage;
const chromiumVersion:string = process.versions.chrome;


/*
 * Remember to add yourself to the contributors array in the package.json
 * if you're improving the code of this application
 */

let appContributors:Array<string>;
if (Array.isArray(packageJson.contributors) && packageJson.contributors.length) {
    appContributors = [ appAuthor, ...packageJson.contributors ];
} else {
    appContributors = [ appAuthor ];
}

// "Dynamic" variables that shouldn't be changed:

const stringContributors = appContributors.join(', ');
const singleInstance = app.requestSingleInstanceLock();
let mainWindow:BrowserWindow;
let tray:Promise<Tray>, l10nStrings:lang, updateInterval:NodeJS.Timeout|undefined;

// Year format for the copyright

const copyYear = appYear+'-'+updateYear;

// Fake Chromium User Agent:

const fakeUserAgent = getUserAgent(chromiumVersion);

// "About" Panel:

function aboutPanel():void {
	const aboutVersions = "Electron: "+process.versions.electron+"    Node: "+process.versions.node+"    Chromium: "+process.versions.chrome
    app.setAboutPanelOptions({
        applicationName: appFullName,
        applicationVersion: `v${appVersion}${devFlag}`,
        authors: appContributors,
        website: appRepo,
        credits: `${l10nStrings.help.contributors} ${stringContributors}`,
        copyright: `Copyright © ${copyYear} ${appAuthor}\n\n${l10nStrings.help.credits}\n\n${aboutVersions}`,
        iconPath: appIcon
    });
}

function createWindow():BrowserWindow {

    // Check the window state

    const mainWindowState = windowStateKeeper('win');

    // Browser window
    
    const win = new BrowserWindow({
        title: appFullName,
        minWidth: minWinWidth,
        minHeight: minWinHeight,
        height: mainWindowState.height,
        width: mainWindowState.width,
        backgroundColor: "#2F3136",
        icon: appIcon,
        webPreferences: {
            enableRemoteModule: false,
            nodeIntegration: false, // Won't work with the true value.
            devTools: true, // Too usefull to be blocked.
            contextIsolation: false // Disabled because of the capturer.
        }
    });

    // Preload scripts:

    win.webContents.session.setPreloads([
        appDir+"/src/js/renderer/preload-capturer.js"
    ]);

    // Content Security Policy
    
    let csp="default-src 'self' blob: data: 'unsafe-inline'";
    csp+=" https://*.discordapp.net https://*.discord.com https://*.discordapp.com https://discord.com https://jcw87.github.io" // HTTPS
    csp+=" wss://*.discord.media wss://*.discord.gg wss://*.discord.com"; // WSS
    /**
     * Discord servers, blocking them makes web app unusable.
     */
    if (!configData.csp.thirdparty.hcaptcha) {
		// hCaptcha
		csp+=" https://assets.hcaptcha.com https://imgs.hcaptcha.com https://hcaptcha.com https://newassets.hcaptcha.com"
	}
	if (!configData.csp.thirdparty.spotify) {
		// Spotify API
        csp+=" wss://dealer.spotify.com https://api.spotify.com"
    }
    if (!configData.csp.thirdparty.gif) {
		// GIF providers
        csp+=" https://media.tenor.co https://media.tenor.com https://c.tenor.com https://media.giphy.com"
    }
    /**
     * Servers above can be blocked by user via settings.
     */
    csp+="; script-src 'self' 'unsafe-inline' 'unsafe-eval'";
    if (!configData.csp.thirdparty.hcaptcha){
		// hCaptcha
		csp+=" https://hcaptcha.com https://assets.hcaptcha.com https://newassets.hcaptcha.com"
	}
	/**
	 * Scripts that allowed to run by CSP.
	 */
    if (!configData.csp.disabled) {
        win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [csp]
                }
            });
        });
    }
    let childCsp="default-src 'self' blob:"

    // Permissions:

    win.webContents.session.setPermissionCheckHandler( (webContents, permission) => {
        if(webContents.getURL().includes(appRootURL)){
            return true;
        } else {
            console.warn(`[${l10nStrings.dialog.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.check.denied}`, webContents.getURL(), permission);
            return false;
        }
    });
    win.webContents.session.setPermissionRequestHandler( (webContents, permission, callback) => {
        if(webContents.getURL().includes(appRootURL)){
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

    getMenu.context(win, l10nStrings, devel);
    if(!configData.disableTray) tray = getMenu.tray(appTrayIcon, win, l10nStrings, childCsp, appFullName);
    getMenu.bar(packageJson.repository.url, win, l10nStrings, devel);

    // Open external URLs in default browser

    win.webContents.on('new-window', (event, externalURL) => {
        event.preventDefault();
        shell.openExternal(externalURL);
    });

    // "Red dot" icon feature

    win.webContents.once('did-finish-load', () => {
        setTimeout(function(){
            win.webContents.on('page-favicon-updated', async () => {
                const t = await tray
                if(!win.isFocused() && !configData.disableTray) t.setImage(appTrayPing);
            });
        }, 5000);
        app.on('browser-window-focus', async () => {
            const t = await tray
            if(!configData.disableTray) t.setImage(appTrayIcon);
        });

        // Hidable animated side bar:

        if (appConfig.has('mobileMode') && appConfig.get('mobileMode')) async () => {
            const key = await win.webContents.insertCSS(".sidebar-2K8pFh{ width: 0px !important; }");
            globalVars.set('css1Key',key);
        }

        // Animate menu
        
        win.webContents.insertCSS(".sidebar-2K8pFh{ transition: width 1s; transition-timing-function: ease;}");
    });

    // Window Title

    win.on('page-title-updated', (event:Event, title:string) => {
		if(title == "Discord") {
			event.preventDefault();
			win.setTitle(appFullName);
		}
	});
    return win;
}

// Remember window state

interface windowStatus {
	width: number,
	height: number,
	isMaximized?: boolean
}

function windowStateKeeper(windowName:string) {

    let window:BrowserWindow, windowState:windowStatus;

    function setBounds():windowStatus {
		let wS:windowStatus|undefined,wState:windowStatus;
        if (winStorage.has(`${windowName}`)) {
            wS = winStorage.get(`${windowName}`);
            if (wS === undefined) {
				wState = {
					width: winWidth,
					height: winHeight
				}
			} else {
				wState = wS;
			}
        } else {
			wState = {
				width: winWidth,
				height: winHeight
			}
        }
        return wState;
    }

    function saveState():void {
        if (!windowState.isMaximized) {
            windowState = window.getBounds();
        }
        windowState.isMaximized = window.isMaximized();
        winStorage.set(`${windowName}`, windowState);
    }

    function track(win:BrowserWindow):void {
        window = win;
        win.on('resize', saveState);
        win.on('close', saveState);
    }
    windowState=setBounds();
    return({
        width: windowState.width,
        height: windowState.height,
        isMaximized: windowState.isMaximized,
        track
    });
}

function main():void {
    winWidth = minWinWidth+(screen.getPrimaryDisplay().workAreaSize.width/3);
    winHeight = minWinHeight+(screen.getPrimaryDisplay().workAreaSize.height/3);
    l10nStrings = loadTranslations();
    checkVersion(l10nStrings, devel, appIcon, updateInterval);
    updateInterval = setInterval(function(){checkVersion(l10nStrings, devel, appIcon, updateInterval)}, 1800000);
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