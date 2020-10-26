// Load the functions that we need to have from the electron
const { app, BrowserWindow, Tray, Menu, MenuItem, shell } = require('electron')

// Read properties from package.json
var packageJson = require('./package.json');

// Vars to modify app behavior
var appName = 'Discord'
var appURL = 'https://discord.com/app'
var appIcon = 'icons/app.png'
var appTrayIcon = 'icons/tray.png'
var appTrayIconSmall = 'icons/tray-small.png'
var winWidth = 1000
var winHeight = 600

// "About" information
var appFullName = 'Electron Discord WebApp'
var appVersion = packageJson.version;
var appAuthor = 'Spacingbat3'
var appCredits = "Thanks to GyozaGuy for his electron discord app – it was good source\nto learn about electron and making the Discord web app."
var appYear = '2020' // the year from app exists
var appRepo = "https://github.com/SpacingBat3/electron-discord-webapp"
const singleInstance = app.requestSingleInstanceLock()
var mainWindow
// Add yourself there if you're doing PR to this repository.
// The valid format if JavaScript array. ( = [var,"string"] )
// Removing any entry of array there will deny your PR!
// Same when spamming random entries!

var appContributors = [
	appAuthor
]

// "Static" Variables that shouldn't be changed

var chromeVersion = process.versions['chrome']
let tray = null
var wantQuit = false
var currentYear = new Date().getFullYear()
var stringContributors = appContributors.join(', ')

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
	var fakeUserAgent = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
};

function createWindow () {

	//Browser window
	
	const win = new BrowserWindow({
		title: appName,
		height: winHeight,
		width: winWidth,
		backgroundColor: "#2F3136",
		icon: appIcon,
		webPreferences: {
			nodeIntegration: false, // won't work with the true value
			devTools: false
		}
	})
	win.loadURL(appURL,{userAgent: fakeUserAgent})
	win.setAutoHideMenuBar(true);
	win.setMenuBarVisibility(false);

	// Contex Menu with spell checker

	win.webContents.on('context-menu', (event, params) => {
		const cmenu = new Menu()
		for (const suggestion of params.dictionarySuggestions) {
			cmenu.append(new MenuItem({
				label: suggestion,
				click: () => win.webContents.replaceMisspelling(suggestion)
			}))
		}
		if (params.misspelledWord) {
			cmenu.append(
				new MenuItem({
					label: 'Add to dictionary',
					click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
				})
			)
		}
		cmenu.popup()
	})

	// Tray menu

	tray = new Tray(appTrayIcon)
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Top Secret Cotrol Panel', enabled: false, icon: appTrayIconSmall },
		{ type: 'separator' },
		{ label: 'About', role: 'about', click: function() { app.showAboutPanel();;}},
		{ type: 'separator' },
		{ label: 'Toogle', click: function() { win.isVisible() ? win.hide() : win.show();; } },
		{ label: 'Quit Discord', click: function() {  wantQuit=true; app.quit();; } }
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
	}
})

// About panel
app.setAboutPanelOptions({
	applicationName: appFullName,
	iconPath: appIcon,
	applicationVersion: appVersion,
	authors: appContributors,
	website: appRepo,
	credits: `Authors and contributors: ${stringContributors}`,
	copyright: `Copyright © ${copyYear} ${appAuthor}\n\n${appCredits}`
})
