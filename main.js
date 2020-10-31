// Load the stuff we need to have there:
const { app, BrowserWindow, Tray, Menu, MenuItem, shell, ipcMain } = require('electron')
const fs = require('fs')


// Get current app dir – also removes the need of importing icons manualy to the electron package dir.
var appDir = app.getAppPath()

// Somehow specifying appFsDir instead appDir fixes `fs`
var appFsDir = appDir

// Check if we are using the packaged version.
// Fix for "About" icon (that can't be loaded with the electron when it is packaged in ASAR)
if (appDir.indexOf("app.asar") < 0) {
	var appIconDir = `${appDir}/icons`
} else {
	var appIconDir = process.resourcesPath
}

// Read properties from *.json's files
var packageJson = require(`${appDir}/package.json`)

// Load string translations:
function loadTranslations() {
	var systemLang = app.getLocale()
	var langDir = `lang/${systemLang}/strings.json`
	if(fs.existsSync(`${appFsDir}/${langDir}`)) {
		// Always recycle variables ;)
		var langDir = `${appDir}/lang/${systemLang}/strings.json`
	} else {
		// Default lang to english
		var langDir = `${appDir}/lang/en-GB/strings.json`
	}
	var l10nStrings = require(langDir)
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


/* Remember to add yourself to the contributors array in the package.json
   If you're improving the code of this application */
if (Array.isArray(packageJson.contributors) && packageJson.contributors.length) {
	var appContributors = [ appAuthor, ...packageJson.contributors ]
} else {
	var appContributors = [appAuthor]
}

// "Static" Variables that shouldn't be changed

var chromeVersion = process.versions.chrome
let tray = null
var wantQuit = false
var currentYear = new Date().getFullYear()
var stringContributors = appContributors.join(', ')
const singleInstance = app.requestSingleInstanceLock()
var mainWindow

// Year format for copyright
if (appYear == currentYear){
	var copyYear = appYear
} else {
	var copyYear = `${appYear}-${currentYear}`
}

// Checks the platform and generates the proper User Agent:
if (process.platform == 'darwin') {
	var fakeUserAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
} else if (process.platform == 'win32') {
	var fakeUserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
} else {
	/* Don't lie we're using ARM (or x86) CPU – maybe then Discord will understand
	then how popular it is on Raspberries and Linux ARM ;) */
	if (process.arch == 'arm64') {
		var cpuArch = "aarch64"
	} else if (process.arch == 'arm') {
		var cpuArch = "armv7"
	} else if (process.arch == 'ia32') {
		var cpuArch = "x86"
	} else {
		var cpuArch = "x86_64"
	}
	var fakeUserAgent = `Mozilla/5.0 (X11; Linux ${cpuArch}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
};

		
// "About" Panel:

function aboutPanel() {
	l10nStrings = loadTranslations()
	const aboutWindow = app.setAboutPanelOptions({
		applicationName: appFullName,
		iconPath: appIcon,
		applicationVersion: appVersion,
		authors: appContributors,
		website: appRepo,
		credits: `${l10nStrings.contributors} ${stringContributors}`,
		copyright: `Copyright © ${copyYear} ${appAuthor}\n\n${l10nStrings.credits}`
	})
	return aboutWindow
}

function createWindow () {

	// Load translations for this window:
	l10nStrings = loadTranslations()

	// Browser window
	
	const win = new BrowserWindow({
		title: appName,
		height: winHeight,
		width: winWidth,
		backgroundColor: "#2F3136",
		icon: appIcon,
		webPreferences: {
			nodeIntegration: false, // won't work with the true value
			devTools: false,
			preload: `${appDir}/notify.js` // a way to do a ping–pong
		}
	})
	win.loadURL(appURL,{userAgent: fakeUserAgent})
	win.setAutoHideMenuBar(true);
	win.setMenuBarVisibility(false);

	// Contex Menu with spell checker

	win.webContents.on('context-menu', (event, params) => {
		const cmenu = new Menu.buildFromTemplate([
			{ type: 'separator'},
			{ label: l10nStrings.contextCut, role: 'cut' },
			{ label: l10nStrings.contextCopy, role: 'copy' },
			{ label: l10nStrings.contextPaste, role: 'paste' },
			{ type: 'separator'},
		])
		// All stuff associated to the dictionary
		let dictionaryPos = 0
		for (const suggestion of params.dictionarySuggestions) {
			cmenu.insert(dictionaryPos++,new MenuItem({
				label: suggestion,
				click: () => win.webContents.replaceMisspelling(suggestion),
			}))
		}
		if (params.misspelledWord) {
			cmenu.insert(dictionaryPos++,new MenuItem({
				type: 'separator'
			}))
			cmenu.insert(dictionaryPos++,new MenuItem({
				label: l10nStrings.contextDictionaryAdd,
				click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
			}))
			cmenu.insert(dictionaryPos++,new MenuItem({
				type: 'separator'
			}))
		}
		cmenu.popup()
	})

	// Tray menu

	tray = new Tray(appTrayIcon)
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Top Secret Cotrol Panel', enabled: false, icon: appTrayIconSmall },
		{ type: 'separator' },
		{ label: l10nStrings.trayAbout, role: 'about', click: function() { app.showAboutPanel();;}},
		{ type: 'separator' },
		{ label: l10nStrings.trayToggle, click: function() { win.isVisible() ? win.hide() : win.show();; } },
		{ label: l10nStrings.trayQuit, click: function() {  wantQuit=true; app.quit();; } }
	])
	tray.setToolTip('Discord')
	tray.setContextMenu(contextMenu)

	// Exit to tray

	win.on('close', (event) => {
		if (!wantQuit){
			event.preventDefault()
			win.hide()
		}
	})

	// Open external URLs in default browser

	win.webContents.on('new-window', (event, externalURL) => {
		event.preventDefault();
		shell.openExternal(externalURL)
	})
	
	// Notifications:
	
	ipcMain.on('receive-notification', () => {
		if(!win.isFocused()) tray.setImage(appTrayPing);
	})

	app.on('browser-window-focus', () => {
		tray.setImage(appTrayIcon)
	})
	
	// Needed to "cap" the window:
	return win
}

if (!singleInstance) {
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
