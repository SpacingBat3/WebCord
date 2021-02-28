/*
 * Main process script (main.js)
 */
 
// Load the stuff we need to have there:

const { app, BrowserWindow, shell, ipcMain, Menu, Notification } = require('electron');
const fs = require('fs');
const fetch = require('electron-fetch').default;
const path = require('path');
const appConfig = new require('electron-json-config');
const deepmerge = require('deepmerge');

/*
 * Get current app dir – also removes the need of importing icons
 * manually to the electron package dir.
 */

const appDir = app.getAppPath();

/*  
 * Check if we are using the packaged version.
 */

if (appDir.indexOf(".asar") < 0) {
    var devel = true;
    var devFlag = " [DEV]"
} else {
    var devel = false;
}

/*
 * "About" window icon doesn't work
 * (newer GTK versions don't have it anyway)
 */
var appIconDir = `${appDir}/icons`;

const packageJson = require(`${appDir}/package.json`); // Read package.json

// Load scripts:
const getUserAgent = require(`${appDir}/src/js/userAgent.js`);
const getMenu = require(`${appDir}/src/js/menus.js`);

// Load string translations:
function loadTranslations() {
    const systemLang = app.getLocale();
    var localStrings = `src/lang/${systemLang}/strings.json`;
    var globalStrings = require(`${appDir}/src/lang/en-GB/strings.json`);
    if(fs.existsSync(path.join(appDir, localStrings))) {
        var localStrings = require(`${appDir}/src/lang/${systemLang}/strings.json`);
        var l10nStrings = deepmerge(globalStrings, localStrings);
    } else {
        var l10nStrings = globalStrings; // Default lang to english
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
var winWidth = 1000;
var winHeight = 600;

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

if (Array.isArray(packageJson.contributors) && packageJson.contributors.length) {
    var appContributors = [ appAuthor, ...packageJson.contributors ];
} else {
    var appContributors = [appAuthor];
}

// "Dynamic" variables that shouldn't be changed:

let tray = null;
var wantQuit = false;
var stringContributors = appContributors.join(', ');
var mainWindow = null;
var updateInterval = false;
const singleInstance = app.requestSingleInstanceLock();

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

// Known boolean keys from config

configKnownObjects = [
    'disableTray',
    'hideMenuBar',
    'mobileMode'
];

// Year format for the copyright

if (appYear == updateYear){
    var copyYear = appYear;
} else {
    var copyYear = `${appYear}-${updateYear}`;
}

fakeUserAgent = getUserAgent(chromiumVersion);

// Check if there's an update available:

async function checkVersion(){
    const remoteJson = await (await fetch(`https://raw.githubusercontent.com/${repoName}/master/package.json`)).json();
    const githubApi = await (await fetch(`https://api.github.com/repos/${repoName}/releases/latest`)).json();
    const localVersion = packageJson.version.split('.')
    let remoteTag = null;
    let updateMsg = null;
    let updateURL = null;
    var showGui = false;

    if(devel){
        remoteTag = remoteJson.version;
        updateURL = `https://github.com/${repoName}/commit/master`;
    } else {
        remoteTag = githubApi.tag_name;
        updateURL = `https://github.com/${repoName}/releases/latest`;
    }
    var remoteVersion = remoteTag.split('.');

    if(localVersion[0] < remoteVersion[0] || (localVersion[0] == remoteVersion[0] && localVersion[1] < remoteVersion[1]) || (localVersion[0] == remoteVersion[0] && localVersion[1] == remoteVersion[1] && localVersion[2] < remoteVersion[2])) {
        showGui = true
        updateMsg = `There's an update available! (v${packageJson.version} → v${remoteTag})`
    } else if(localVersion[0] > remoteVersion[0] || (localVersion[0] == remoteVersion[0] && localVersion[1] > remoteVersion[1]) || (localVersion[0] == remoteVersion[0] && localVersion[1] == remoteVersion[1] && localVersion[2] > remoteVersion[2])) {
        updateMsg = `Application is newer than in the repository! (v${packageJson.version} → v${remoteTag})`
    } else if(localVersion[0] != remoteVersion[0] || localVersion[1] != remoteVersion[1] || localVersion[2] != remoteVersion[2]) {
        updateMsg = `Application version is different than in the repository! (v${packageJson.version} ≠ v${remoteTag})`
    } else {
        updateMsg = "Application is up-to-date!"
    }

    console.log(`[UPDATE] ${updateMsg}`)

    const updatePopup = {
        title: 'Electron Discord Web App: Update is available!',
        icon: appIcon,
        body: updateMsg
    }
    if(showGui){
        const notification = new Notification(updatePopup);
        notification.on('click', () => {
            shell.openExternal(updateURL);
        });
        notification.show();
    }
    if(updateInterval){
        clearInterval(updateInterval);
    }
}

// "About" Panel:

function aboutPanel() {
    l10nStrings = loadTranslations();
    const aboutWindow = app.setAboutPanelOptions({
        applicationName: appFullName,
        iconPath: appIcon,
        applicationVersion: `v${appVersion} (Electron v${process.versions.electron})${devFlag}`,
        authors: appContributors,
        website: appRepo,
        credits: `${l10nStrings.help.contributors} ${stringContributors}`,
        copyright: `Copyright © ${copyYear} ${appAuthor}\n\n${l10nStrings.help.credits}`
    });
    return aboutWindow;
}

function createWindow() {

    // Check the window state

    const mainWindowState = windowStateKeeper('win');

    // Get known boolean vars from the config

    for (var x = 0, len = configKnownObjects.length; x < len; x++) {
        var y = configKnownObjects[x];
        if (appConfig.get(y)) {
            this[y] = appConfig.get(y);
        } else {
            this[y] = false;
        }
    }

    l10nStrings = loadTranslations(); // Load translations for this window

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

    // Screen Capturer

    win.webContents.session.setPreloads([`${appDir}/src/js/preload-capturer.js`])
    win.webContents.session.setPermissionCheckHandler(async (webContents, permission, details) => {
        return true
    });
    win.webContents.session.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
        callback(true)
    });

    win.loadURL(appURL,{userAgent: fakeUserAgent});
    win.setAutoHideMenuBar(hideMenuBar);
    win.setMenuBarVisibility(!hideMenuBar);
    mainWindowState.track(win);

    // Load all menus:

    cmenu = getMenu.context(win);
    if(!disableTray) tray = getMenu.tray(appTrayIcon, appTrayIconSmall, win);
    menubar = getMenu.bar(packageJson.repository.url, win);

    // Open external URLs in default browser

    win.webContents.on('new-window', (event, externalURL) => {
        event.preventDefault();
        shell.openExternal(externalURL);
    });

    // "Red dot" icon feature

    win.webContents.once('did-finish-load', () => {
        setTimeout(function(){
            win.webContents.on('page-favicon-updated', () => {
                if(!win.isFocused() && !disableTray) tray.setImage(appTrayPing);
        })}, 1000);

        app.on('browser-window-focus', () => {
            if(!disableTray) tray.setImage(appTrayIcon);
        });
    
        /* 
         * Hideable animated side bar:
         * (and now it isn't "dirty"!)
         */

        if (appConfig.has('mobileMode') && appConfig.get('mobileMode')) {
            async function hideCSS() {
                const key = await win.webContents.insertCSS(".sidebar-2K8pFh{ width: 0px !important; }");
                appConfig.set('css1Key',key);
            }
            hideCSS();
        }

        // Animate menu
        
        win.webContents.insertCSS(".sidebar-2K8pFh{ transition: width 1s; transition-timing-function: ease;}");
    });
    return win;
}

// Remember window state

function windowStateKeeper(windowName) {
    let window, windowState;
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
        for (var i = 0, len = eventList.length; i < len; i++) {
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

/*
 * Check if other scripts wants app to quit (through the IPC).
 * Currently unused.
 */

ipcMain.on('want-to-quit', () => {
    var wantQuit = true;
    app.quit();
});


if (!singleInstance) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow){
            if(!mainWindow.isVisible()) mainWindow.show();
            if(mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
    app.on('ready', () => {
        checkVersion();
        updateInterval = setInterval(checkVersion, 1800000);
        mainWindow = createWindow(); // catch window as mainWindow
        aboutWindow = aboutPanel();
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        checkVersion();
        updateInterval = setInterval(checkVersion, 1800000);
        mainWindow = createWindow();
        aboutWindow = aboutPanel();
    }
});
