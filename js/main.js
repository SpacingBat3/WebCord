
// Load the stuff we need to have there:

const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron')
const fs = require('fs')
const appConfig = new require('electron-json-config')
var deepmerge = require('deepmerge')

/*	Get current app dir – also removes the need of importing icons
	manually to the electron package dir. */

var appDir = app.getAppPath()

// Somehow specifying appFsDir as clone of appDir fixes `fs`

var appFsDir = appDir

/*	Check if we are using the packaged version.
	This also fixes for "About" icon (that can't be loaded with the electron
	when it is packaged in ASAR) */

if (appDir.indexOf("app.asar") < 0) {
	var appIconDir = `${appDir}/icons`
} else {
	var appIconDir = process.resourcesPath
}

var packageJson = require(`${appDir}/package.json`) // Read package.json

// Load scripts:
const getUserAgent = require(`${appDir}/js/userAgent.js`)
const getMenu = require(`${appDir}/js/menus.js`)

// Load string translations:
function loadTranslations() {
	var systemLang = app.getLocale()
	var localStrings = `lang/${systemLang}/strings.json`
	var globalStrings = require(`${appDir}/lang/en-GB/strings.json`)
	if(fs.existsSync(`${appFsDir}/${localStrings}`)) {
		var localStrings = require(`${appDir}/lang/${systemLang}/strings.json`)
		var l10nStrings = deepmerge(globalStrings, localStrings)
	} else {
		var l10nStrings = globalStrings // Default lang to english
	}
	return l10nStrings
}

// Vars to modify app behavior
var appName = 'Discord'
var appURL = 'https://discord.com/app'
var appIcon = `${appIconDir}/app.png`
var appTrayIcon = `${appDir}/icons/tray.png`
var appTrayPing = `${appDir}/icons/tray-ping.png`
var appTrayIconSmall = `${appDir}/icons/tray-small.png`
var winWidth = 1000
var winHeight = 600

// "About" information
var appFullName = 'Electron Discord WebApp'
var appVersion = packageJson.version;
var appAuthor = packageJson.author
var appYear = '2020' // the year since this app exists
var appRepo = packageJson.homepage;
var chromiumVersion = process.versions.chrome


/* Remember to add yourself to the contributors array in the package.json
   if you're improving the code of this application */

if (Array.isArray(packageJson.contributors) && packageJson.contributors.length) {
	var appContributors = [ appAuthor, ...packageJson.contributors ]
} else {
	var appContributors = [appAuthor]
}

// "Static" Variables that shouldn't be changed

let tray = null
var wantQuit = false
var currentYear = new Date().getFullYear()
var stringContributors = appContributors.join(', ')
var mainWindow
const singleInstance = app.requestSingleInstanceLock()

// Known boolean keys from config

configKnownObjects = [
	'disableTray',
	'hideMenuBar'
]

// Year format for copyright

if (appYear == currentYear){
	var copyYear = appYear
} else {
	var copyYear = `${appYear}-${currentYear}`
}

fakeUserAgent = getUserAgent(chromiumVersion)

// "About" Panel:

function aboutPanel() {
	l10nStrings = loadTranslations()
	const aboutWindow = app.setAboutPanelOptions({
		applicationName: appFullName,
		iconPath: appIcon,
		applicationVersion: `v${appVersion}`,
		authors: appContributors,
		website: appRepo,
		credits: `${l10nStrings.help.contributors} ${stringContributors}`,
		copyright: `Copyright © ${copyYear} ${appAuthor}\n\n${l10nStrings.help.credits}`
	})
	return aboutWindow
}

function createWindow () {

	const mainWindowState = windowStateKeeper('win') // Check the window state

	// Get known boolean vars from the config

	for (var x = 0, len = configKnownObjects.length; x < len; x++) {
		var y = configKnownObjects[x]
		if (appConfig.get(y)) {
			this[y] = appConfig.get(y)
		} else {
			this[y] = false;
		}
	}

	l10nStrings = loadTranslations() // Load translations for this window

	// Browser window
	
	const win = new BrowserWindow({
		title: appName,
		x: mainWindowState.x,
		y: mainWindowState.y,
		height: mainWindowState.height,
		width: mainWindowState.width,
		backgroundColor: "#2F3136",
		icon: appIcon,
		webPreferences: {
			nodeIntegration: false, // won't work with the true value
			devTools: false,
			preload: `${appDir}/js/notify.js` // a way to do a ping–pong
		}
	})
	win.loadURL(appURL,{userAgent: fakeUserAgent})
	win.setAutoHideMenuBar(hideMenuBar);
	win.setMenuBarVisibility(!hideMenuBar);
	mainWindowState.track(win)

	// Load all menus:

	cmenu = getMenu.context(win)
	if(!disableTray) tray = getMenu.tray(appTrayIcon, appTrayIconSmall, win)
	menubar = getMenu.bar(packageJson.repository.url)

	// Open external URLs in default browser

	win.webContents.on('new-window', (event, externalURL) => {
		event.preventDefault();
		shell.openExternal(externalURL)
	})
	
	// Notifications:
	
	ipcMain.on('receive-notification', () => {
		if(!win.isFocused() && !disableTray) tray.setImage(appTrayPing);
	})

	ipcMain.on('notification-clicked', () => {
		if(!disableTray) tray.setImage(appTrayIcon)
	})

	app.on('browser-window-focus', () => {
		if(!disableTray) tray.setImage(appTrayIcon)
	})
	return win
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
			x: undefined,
			y: undefined,
			width: winWidth,
			height: winHeight,
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
		eventList = ['resize', 'move', 'close'];
		for (var i = 0, len = eventList.length; i < len; i++) {
			win.on(eventList[i], saveState);
		}
	}
	setBounds();
	return({
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
		isMaximized: windowState.isMaximized,
		track,
	});
}

// Check if other scripts want app to quit

ipcMain.on('want-to-quit', () => {
	var wantQuit = true
	app.quit()
})


if (!singleInstance) {
	console.log("Nope! This app is already running!")
	app.quit()
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if (mainWindow){
			if(!mainWindow.isVisible()) mainWindow.show()
			if(mainWindow.isMinimized()) mainWindow.restore()
			mainWindow.focus()
		}
	})
	app.on('ready', () => {
		mainWindow = createWindow() // catch window as mainWindow
		aboutWindow = aboutPanel()
	})
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		mainWindow = createWindow()
		aboutWindow = aboutPanel()
	}
})
