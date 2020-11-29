const { app, Menu, BrowserWindow, MenuItem, Tray, Notification, dialog, shell } = require('electron')
const appConfig = new require('electron-json-config')
var wantQuit = false
var isBadTime = false
const appDir = app.getAppPath()

// Contex Menu with spell checker

exports.context = (windowName) => {
	cname = windowName.webContents.on('context-menu', (event, params) => {
		const cmenu = new Menu.buildFromTemplate([
			{ type: 'separator'},
			{ label: l10nStrings.context.cut, role: 'cut' },
			{ label: l10nStrings.context.copy, role: 'copy' },
			{ label: l10nStrings.context.paste, role: 'paste' },
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
				label: l10nStrings.context.dictionaryAdd,
				click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
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

exports.tray = (Icon, IconSmall, windowName) => {
	tray = new Tray(Icon)
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Top Secret Control Panel', enabled: false, icon: IconSmall },
		{ type: 'separator' },
		{ label: l10nStrings.help.about, role: 'about', click: function() { app.showAboutPanel();;}},
		{ type: 'separator' },
		{ label: l10nStrings.tray.toggle, click: function() { windowName.isVisible() ? windowName.hide() : windowName.show();; } },
		{ label: l10nStrings.tray.quit, click: function() { wantQuit = true; app.quit();; } }
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

exports.bar = (repoLink, mainWindow) => {
	var webLink = repoLink.substring(repoLink.indexOf("+")+1)
	const menu = Menu.buildFromTemplate([
		{ role: 'fileMenu', label: l10nStrings.menubar.file},
		{ role: 'editMenu', label: l10nStrings.menubar.edit},
		{ role: 'viewMenu', label: l10nStrings.menubar.view},
		{ role: 'windowMenu', label: l10nStrings.menubar.window},
		{ label: l10nStrings.menubar.options.groupName, submenu: [{
				label: l10nStrings.menubar.options.disableTray,
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
				label: l10nStrings.menubar.options.hideMenuBar,
				type: 'checkbox',
				checked: appConfig.get('hideMenuBar'),
				click: () => { 
					if (appConfig.has('hideMenuBar')) {
						appConfig.set('hideMenuBar', !appConfig.get('hideMenuBar'))
						if (appConfig.get('hideMenuBar') == true) {
							dialog.showMessageBoxSync({
								type: "warning",
								title: l10nStrings.warning.hideMenuBar.title,
								message: l10nStrings.warning.hideMenuBar.body,
								buttons: [l10nStrings.buttons.continue]
							})
						}
					} else {
							appConfig.set('hideMenuBar', true)
						
					}
				}
			},
			/* This will be back once I'll do my own JS game :)
			 * Right now, if you're reading this, you can use it
			 * to integrate any website within my app (for some reason)
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
						icon: `${appDir}/icons/game.png`
					})
					child.loadFile(`${appDir}/offline/index.html`)
					child.setAutoHideMenuBar(true)
					child.setMenuBarVisibility(false)
					child.removeMenu()
					console.log("Do you want to have a Bad Time? 'Cause if you don't close this window right now... you're not going to like what's happen next.")
				}
				
			}
			*/
		]},
		{ label: l10nStrings.help.groupName, role: 'help', submenu: [
			{ label: l10nStrings.help.about, role: 'about', click: function() { app.showAboutPanel();;}},
			{ label: l10nStrings.help.repo, click: function() { shell.openExternal(webLink);;} },
			{ label: l10nStrings.help.docs, enabled: false, click: function() { shell.openExternal('https://electronjs.org/docs');;} },
			{ label: l10nStrings.help.bugs, click: function() { shell.openExternal(`${webLink}/issues`);;} }
		]}
	])
	Menu.setApplicationMenu(menu)
	return menu
}
