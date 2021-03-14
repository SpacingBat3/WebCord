/*
 * Menu Objects (menus.ts)
 */
import { app, Menu, BrowserWindow, MenuItem, Tray, dialog, shell, nativeImage } from 'electron';
import { lang } from './object.js';
import fetch from 'electron-fetch';
import appConfig = require('electron-json-config');
import os = require('os');
let wantQuit = false;

// Contex Menu with spell checker

export function context (windowName: BrowserWindow, strings: lang): void {
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

let funMode = 0;
const today = new Date();
if(os.userInfo().username == 'spacingbat3' || (today.getDate() == 1 && today.getMonth() == 3)) {
	funMode = 1; // There's always fun for me ;)
} else if (os.userInfo().username == 'pi' && today.getDate() == 14 && today.getMonth() == 3) {
	funMode = 2; // Happy π day!
}

// Tray menu

export async function tray (Icon: string, windowName: BrowserWindow, strings: lang): Promise<Tray> {
	const tray = new Tray(Icon);
	let image:string|nativeImage;
	if (funMode === 2) {
		image = nativeImage.createFromBuffer(await (await fetch('https://raw.githubusercontent.com/iiiypuk/rpi-icon/master/16.png')).buffer());
	} else {
		image = nativeImage.createFromPath(Icon).resize({width:16})
	}
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Top Secret Control Panel',
			enabled: (funMode === 1),
			icon: image,
			click: () => {
				const child = new BrowserWindow({
					parent: windowName,
					title: "Top Secret Control Panel",
					minWidth: 640,
					maxWidth: 640,
					width: 640,
					minHeight: 480,
					maxHeight: 480,
					height: 480,
					modal: true,
					backgroundColor: "#000",
					icon: image,
					webPreferences: {
						nodeIntegration: false,
						contextIsolation: true
					}
				})
				// Let's load a virus! Surely, nothing wrong will happen:
				child.loadURL('http://www.5z8.info/worm.exe_i0b8xn_snufffilms')
				child.setAutoHideMenuBar(true)
				child.setMenuBarVisibility(false)
				child.removeMenu()
			}
		},
		{ type: 'separator' },
		{
			label: strings.help.about,
			role: 'about',
			click: function() { app.showAboutPanel();}
		},
		{ type: 'separator' },
		{
			label: strings.tray.toggle,
			click: function() { 
				windowName.isVisible() ? windowName.hide() : windowName.show(); 
			} 
		},
		{ label: strings.tray.quit,
			click: function(){
				wantQuit = true;
				app.quit();
			}
		}
	]);
	tray.setContextMenu(contextMenu);
	tray.setToolTip("Electron Discord Web App");
	// Exit to the tray
	windowName.on('close', (event) => {
		if (!wantQuit){
			event.preventDefault();
			windowName.hide();
		}
	});
	return tray;
}

// Menu Bar

export function bar (repoLink: string, mainWindow: BrowserWindow, strings: lang): Menu {
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
							title: strings.dialog.warning,
							message: strings.dialog.hideMenuBar,
							buttons: [strings.dialog.buttons.continue]
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