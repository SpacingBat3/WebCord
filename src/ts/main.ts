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

/*
 * Electron API and other node modules.
 */

import {
    app,
    BrowserWindow,
    shell,
    Tray,
    screen
} from 'electron';

if(app.commandLine.hasSwitch('version')){
    console.log(app.getName()+' v'+app.getVersion());
    app.exit();
}

import * as fs from 'fs';
import * as path from 'path';

/*
 * Migrate old config dir to the new one.
 */

const oldUserPath = path.join(app.getPath('userData'), '..', "Electron Discord Web App");
if(fs.existsSync(oldUserPath)) {
    fs.rmdirSync(app.getPath('userData'), { recursive: true });
    fs.renameSync(oldUserPath, app.getPath('userData'));
}

/*
 * Import functions/types/variables declarations:
 */
import {
    appInfo,
    guessDevel,
    configData,
    winStorage,
    appConfig,
    lang,
    loadTranslations
} from './mainGlobal';

import { packageJson } from './global'

/*
 * Get current app dir – also removes the need of importing icons
 * manually to the electron package dir.
 */

/*  
 * Check if we are using the packaged version.
 */

const { devel, devFlag } = guessDevel()

// Load scripts:
import {checkVersion} from './update'
import {getUserAgent} from './userAgent';
import * as getMenu from './menus';

// Removes deprecated config properties (if they exists)

const deprecated = ["csp.strict","windowState","css1Key"];
appConfig.deleteBulk(deprecated);

// Vars to modify app behavior


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

let appContributors:Array<string> = [ appAuthor ];

// Hence GTK allows for tags there, generate links to website/email
if (packageJson.author.url) {
    appContributors = [ '<a href="'+packageJson.author.url+'">'+appAuthor+'</a>' ]
} else if (packageJson.author.email) {
    appContributors = [ '<a href="'+packageJson.author.email+'">'+appAuthor+'</a>' ]
}
if (Array.isArray(packageJson.contributors) && packageJson.contributors.length>0) {
    for (let n=0; n<packageJson.contributors.length; n++) {
		// Guess "person" format:
		if (packageJson.contributors[n].name) {
            if (process.platform=="linux") {
                const { name, email, url } = packageJson.contributors[n]
                let linkTag="", linkTagClose="";
                if (url) {
                    linkTag='<a href="'+url+'">'
                } else if (email) {
                    linkTag='<a href="mailto:'+email+'">'
                }
                if (linkTag!=="") linkTagClose = "</a>"
                appContributors.push(linkTag+name+linkTagClose)
            } else {
                appContributors.push(packageJson.contributors[n].name);
            }
		} else {
			appContributors.push(packageJson.contributors[n])
		}
	}
}

// "Dynamic" variables that shouldn't be changed:

const stringContributors = appContributors.join(', ');
const singleInstance = app.requestSingleInstanceLock();
let mainWindow:BrowserWindow,winHeight:number,winWidth:number;
let tray:Promise<Tray>, l10nStrings:lang, updateInterval:NodeJS.Timeout|undefined;

// Year format for the copyright

const copyYear = appYear+'-'+updateYear;

// Fake Chromium User Agent:

const fakeUserAgent = getUserAgent(chromiumVersion);

// "About" Panel:

function aboutPanel():void {
    let iconPath:string;
    if (fs.existsSync(appInfo.icon)) {
        iconPath=appInfo.icon
    } else {
        iconPath='/usr/share/icons/hicolor/512x512/apps/'+packageJson.name+'.png'
    }
	const aboutVersions = "Electron: "+process.versions.electron+"    Node: "+process.versions.node+"    Chromium: "+process.versions.chrome
    app.setAboutPanelOptions({
        applicationName: appFullName,
        applicationVersion: `v${appVersion}${devFlag}`,
        authors: appContributors,
        website: appRepo,
        credits: `${l10nStrings.help.contributors} ${stringContributors}`,
        copyright: `Copyright © ${copyYear} ${appAuthor}\n\n${l10nStrings.help.credits}\n\n${aboutVersions}`,
        iconPath: iconPath
    });
}

function createWindow():BrowserWindow {

    // Check the window state

    const mainWindowState = windowStateKeeper('win');

    // Browser window
    
    const win = new BrowserWindow({
        title: appFullName,
        minWidth: appInfo.minWinWidth,
        minHeight: appInfo.minWinHeight,
        height: mainWindowState.height,
        width: mainWindowState.width,
        backgroundColor: "#2F3136",
        icon: appInfo.icon,
        webPreferences: {
            enableRemoteModule: false,
            nodeIntegration: false, // Won't work with the true value.
            devTools: true, // Too usefull to be blocked.
            contextIsolation: false // Disabled because of the capturer.
        }
    });

    // Preload scripts:

    win.webContents.session.setPreloads([
        app.getAppPath()+"/src/js/renderer/capturer.js",
        app.getAppPath()+"/src/js/renderer/cosmetic.js"
    ]);

    // Content Security Policy
    
    let csp="default-src 'self' blob: data: 'unsafe-inline'";
    csp+=" https://*.discordapp.net https://*.discord.com https://*.discordapp.com https://discord.com" // HTTPS
    csp+=" wss://*.discord.media wss://*.discord.gg wss://*.discord.com"; // WSS
    /**
     * Discord servers, blocking them makes web app unusable.
     */
    if (!configData.csp.thirdparty.hcaptcha) {
		// hCaptcha
		csp+=" https://assets.hcaptcha.com https://imgs.hcaptcha.com https://hcaptcha.com https://newassets.hcaptcha.com"
	}
    if (!configData.csp.thirdparty.algoria) {
		// Algolia
		csp+=" https://nktzz4aizu-dsn.algolia.net https://nktzz4aizu-1.algolianet.com"
        csp+=" https://nktzz4aizu-2.algolianet.com https://nktzz4aizu-3.algolianet.com https://i.scdn.co"
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
    const childCsp="default-src 'self' blob:"

    // Permissions:

    win.webContents.session.setPermissionCheckHandler( (webContents, permission) => {
        if(webContents.getURL().includes(appInfo.rootURL)){
            return true;
        } else {
            console.warn(`[${l10nStrings.dialog.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.check.denied}`, webContents.getURL(), permission);
            return false;
        }
    });
    win.webContents.session.setPermissionRequestHandler( (webContents, permission, callback) => {
        if(webContents.getURL().includes(appInfo.rootURL)){
            return callback(true);
        } else {
            console.warn(`[${l10nStrings.dialog.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.request.denied}`, webContents.getURL(), permission);
            return callback(false);
        }
    });

    win.loadURL(appInfo.URL,{userAgent: fakeUserAgent});
    win.setAutoHideMenuBar(configData.hideMenuBar);
    win.setMenuBarVisibility(!configData.hideMenuBar);
    mainWindowState.track(win);

    // Load all menus:

    getMenu.context(win);
    if(!configData.disableTray) tray = getMenu.tray(win, childCsp, appFullName);
    getMenu.bar(packageJson.repository.url, win);

    // Open external URLs in default browser
    {
        const electronVersion = {
            major: parseInt(process.versions.electron.split('.')[0]),
            minior: parseInt(process.versions.electron.split('.')[1]),
            patch: parseInt(process.versions.electron.split('.')[2])
        }
        /** 
         * Use new function in Electron release 12.0.5 or newer.
         * 
         * The `webContents.setWindowOpenHandler()` was broken
         * in releases `>= 12.0.0` and `<= 12.0.4` and haven't existed in
         * Electron version `< 12`.
         * 
         * When building app for Electron releases `< 12` this will cause
         * TypeScript errors – just ignore them if so, `tsc` should generate
         * JavaScript files anyway.
         * 
         * Be aware that old method might be removed once Electron will
         * remove 'new-window' event from `webContents` in its API.
         */
        if (electronVersion.major >= 12 && electronVersion.minior >= 5)
            win.webContents.setWindowOpenHandler((details) => {
                shell.openExternal(details.url);
                return { action: 'deny' };
            });
        else
            win.webContents.on('new-window', (event, externalURL) => {
                event.preventDefault();
                shell.openExternal(externalURL);
            });
    }

    // "Red dot" icon feature

    win.webContents.once('did-finish-load', () => {
        setTimeout(function(){
            win.webContents.on('page-favicon-updated', async () => {
                const t = await tray
                if(!win.isFocused() && !configData.disableTray) t.setImage(appInfo.trayPing);
            });
        }, 5000);
        app.on('browser-window-focus', async () => {
            const t = await tray
            if(!configData.disableTray) t.setImage(appInfo.trayIcon);
        });
    });

    // Window Title

    win.on('page-title-updated', (event:Event, title:string) => {
		if(title == "Discord") {
			event.preventDefault();
			win.setTitle(appFullName);
		}
	});

    // Animate menu

    win.webContents.on('did-finish-load', () => {
        win.webContents.insertCSS(".sidebar-2K8pFh{ transition: width 1s; transition-timing-function: ease;}");
    })

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
    winWidth = appInfo.minWinWidth+(screen.getPrimaryDisplay().workAreaSize.width/3);
    winHeight = appInfo.minWinHeight+(screen.getPrimaryDisplay().workAreaSize.height/3);
    l10nStrings = loadTranslations();
    checkVersion(l10nStrings, devel, appInfo.icon, updateInterval);
    updateInterval = setInterval(function(){checkVersion(l10nStrings, devel, appInfo.icon, updateInterval)}, 1800000);
    mainWindow = createWindow();
    aboutPanel();
}

if (!singleInstance) {
    console.log(loadTranslations().misc.singleInstance)
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