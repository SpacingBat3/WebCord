/*
 * Menu Objects (menus.js
 */
import { app, Menu, BrowserWindow, MenuItem, Tray, dialog, shell } from 'electron'
import appConfig = require('electron-json-config')
let wantQuit = false

interface json {
	[key: string]: any
}
//const appDir = app.getAppPath()

// Contex Menu with spell checker

export function context (windowName: BrowserWindow, strings: json): void {
	windowName.webContents.on('context-menu', (event, params) => {
		const cmenu = Menu.buildFromTemplate([
			{ type: 'separator'},
			{ label: strings.context.cut, role: 'cut' },
			{ label: strings.context.copy, role: 'copy' },
			{ label: strings.context.paste, role: 'paste' },
			{ type: 'separator'},
		])
		// All stuff associated to the dictionary
		let dictionaryPos = 0
		for (const suggestion of params.dictionarySuggestions) {
			cmenu.insert(dictionaryPos++,new MenuItem({
				label: suggestion,
				click: () => windowName.webContents.replaceMisspelling(suggestion),
			}))
		}
		if (params.misspelledWord) {
			cmenu.insert(dictionaryPos++,new MenuItem({
				type: 'separator'
			}))
			cmenu.insert(dictionaryPos++,new MenuItem({
				label: strings.context.dictionaryAdd,
				click: () => windowName.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
			}))
			cmenu.insert(dictionaryPos++,new MenuItem({
				type: 'separator'
			}))
		}
		cmenu.popup()
		return cmenu
	})
}

// Tray menu

export function tray (Icon: string, IconSmall: string, windowName: BrowserWindow, strings: json): Tray {
	const tray = new Tray(Icon)
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Top Secret Control Panel', enabled: false, icon: IconSmall },
		{ type: 'separator' },
		{ label: strings.help.about, role: 'about', click: function() { app.showAboutPanel();}},
		{ type: 'separator' },
		{ label: strings.tray.toggle, click: function() { windowName.isVisible() ? windowName.hide() : windowName.show(); } },
		{ label: strings.tray.quit, click: function() { wantQuit = true; app.quit(); } }
	])
	tray.setToolTip('Discord')
	tray.setContextMenu(contextMenu)
	// Exit to the tray
	windowName.on('close', (event) => {
		if (!wantQuit){
			event.preventDefault()
			windowName.hide()
		}
	})
	return tray
}

// Menu Bar

export function bar (repoLink: string, mainWindow: BrowserWindow, strings: json): Menu {
	const webLink = repoLink.substring(repoLink.indexOf("+")+1)
	const menu = Menu.buildFromTemplate([
		{ role: 'fileMenu', label: strings.menubar.file},
		{ role: 'editMenu', label: strings.menubar.edit},
		{ role: 'viewMenu', label: strings.menubar.view},
		{ role: 'windowMenu', label: strings.menubar.window},
		{ label: strings.menubar.options.groupName, submenu: [{
				label: strings.menubar.options.disableTray,
				type: 'checkbox', checked: appConfig.get('disableTray'),
				click: () => { 
					if (appConfig.has('disableTray')) {
						appConfig.set('disableTray', !appConfig.get('disableTray'))
					} else {
						appConfig.set('disableTray', true)
					} 
				}
			},
			{
				label: strings.menubar.options.hideMenuBar,
				type: 'checkbox',
				checked: appConfig.get('hideMenuBar'),
				click: () => { 
					if (appConfig.has('hideMenuBar')) {
						appConfig.set('hideMenuBar', !appConfig.get('hideMenuBar'))
					} else {
						appConfig.set('hideMenuBar', true)
						dialog.showMessageBoxSync({
							type: "warning",
							title: strings.warning.hideMenuBar.title,
							message: strings.warning.hideMenuBar.body,
							buttons: [strings.buttons.continue]
						})
					}
				}
			},
			{
				label: strings.menubar.options.mobileMode,
				type: 'checkbox',
				checked: appConfig.get('mobileMode'),
				click: async () => { 
					if (appConfig.has('mobileMode')) {
						appConfig.set('mobileMode', !appConfig.get('mobileMode'));
					} else {
						appConfig.set('mobileMode', true);
					}
					// who cares it will produce a lot of entries in CSS:
					if (appConfig.get('mobileMode')) {
						const key = await mainWindow.webContents.insertCSS(".sidebar-2K8pFh{ width: 0px !important; }");
						appConfig.set('css1Key',key);
					} else {
						const key = appConfig.get('css1Key');
						mainWindow.webContents.removeInsertedCSS(key);
					}
				}
			}
		]},
			/* An unused placeholder
			{
			
				label: "Template",
				click: () => {
					const child = new BrowserWindow({
						parent: mainWindow,
						title: "Not working!",
						width: 640,
						height: 480,
						modal: true,
						background: "#000",
						icon: `${appDir}/icons/temp.png`
					})
					child.loadFile(`${appDir}/offline/index.html`)
					child.setAutoHideMenuBar(true)
					child.setMenuBarVisibility(false)
					child.removeMenu()
					console.log("You just found an easter egg!")
				}
				
			}
			*/
		{ label: strings.help.groupName, role: 'help', submenu: [
			{ label: strings.help.about, role: 'about', click: function() { app.showAboutPanel();}},
			{ label: strings.help.repo, click: function() { shell.openExternal(webLink);} },
			{ label: strings.help.docs, enabled: false, click: function() { shell.openExternal('https://electronjs.org/docs');} },
			{ label: strings.help.bugs, click: function() { shell.openExternal(`${webLink}/issues`);} }
		]}
	])
	Menu.setApplicationMenu(menu)
	return menu
}
