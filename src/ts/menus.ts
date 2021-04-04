/*
 * Menu Objects (menus.ts)
 */
import {
	app,
	Menu,
	BrowserWindow,
	MenuItem,
	Tray,
	dialog,
	shell,
	nativeImage,
	MenuItemConstructorOptions,
	clipboard
} from 'electron';

import {
	lang,
	appConfig,
	globalVars,
	configData,
	getDevel
} from './object.js';

import fetch from 'electron-fetch';
import os = require('os');

let wantQuit = false;

function configSwitch(value:string, command?: () => void):void {
	if (appConfig.has(value)) {
		appConfig.set(value, !appConfig.get(value))
	} else {
		appConfig.set(value, true)
	}
	if (command) command();
}

function updateMenuBarItem(id:string, value:boolean):void {
	const applicationMenu = Menu.getApplicationMenu();
	if(applicationMenu!==null) {
		const menuitem = applicationMenu.getMenuItemById(id);
		if(menuitem!==null) menuitem.enabled = value;
	}
}

// Contex Menu with spell checker

export function context (windowName: BrowserWindow, strings: lang, devel: boolean): void {
	windowName.webContents.on('context-menu', (event, params) => {
		const cmenu:(MenuItemConstructorOptions|MenuItem)[] = [
			{ type: 'separator'},
			{ label: strings.context.cut, role: 'cut', enabled: params.editFlags.canCut },
			{ label: strings.context.copy, role: 'copy', enabled: params.editFlags.canCopy },
			{ label: strings.context.paste, role: 'paste', enabled: params.editFlags.canPaste },
			{ type: 'separator'}
		];
		let position=0;
		for (const suggestion of params.dictionarySuggestions) {
			cmenu.splice(++position,0,{
				label: suggestion,
				click: () => windowName.webContents.replaceMisspelling(suggestion)
			});
		}
		if (params.misspelledWord) {
			cmenu.splice(++position,0,{type:'separator'});
			cmenu.splice(++position,0,{
				label: strings.context.dictionaryAdd,
				click: () => windowName.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
			});
			cmenu.splice(++position,0,{type:'separator'});
		}
		if (params.linkURL) {
			cmenu.push({
				label: strings.context.copyURL,
				click: () => clipboard.writeText(params.linkURL)
			});
			if (params.linkText) cmenu.push({
				label: strings.context.copyURLText,
				click: () => clipboard.writeText(params.linkText)
			});
			cmenu.push({type:'separator'});
		}
		if (getDevel(devel, configData.devel)) {
			cmenu.push({
				label: strings.context.inspectElement,
				click: () => windowName.webContents.inspectElement(params.x,params.y)
			});
			cmenu.push({type:'separator'});
		}
		Menu.buildFromTemplate(cmenu).popup({
			window: windowName,
			x: params.x,
			y: params.y
		});
	})
}

let funMode = 0;
const today = new Date();
if(os.userInfo().username == 'spacingbat3' || (today.getDate() == 1 && today.getMonth() == 3)) {
	funMode = 1; // There's always fun for me ;)
} else if (os.userInfo().username == 'pi' && today.getDate() == 14 && today.getMonth() == 2) {
	funMode = 2; // Happy π day!
}

// Tray menu

export async function tray (Icon: string, windowName: BrowserWindow, strings: lang, childCSP: string, toolTip: string): Promise<Tray> {
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
					width: 647,
					height: 485,
					resizable: false,
					modal: true,
					backgroundColor: "#000",
					icon: image,
					webPreferences: {
						enableRemoteModule: false,
						nodeIntegration: false,
						contextIsolation: true
					}
				})
				if (appConfig.get('csp.disabled')) {
					child.webContents.session.webRequest.onHeadersReceived((details, callback) => {
						callback({
							responseHeaders: {
								...details.responseHeaders,
								'Content-Security-Policy': [childCSP]
							}
						});
					});
				}
				// Let's load a virus! Surely, nothing wrong will happen:
				child.loadURL('http://www.5z8.info/worm.exe_i0b8xn_snufffilms');
				child.on('page-title-updated', (event) => {
					event.preventDefault();
				});
				child.setAutoHideMenuBar(true);
				child.setMenuBarVisibility(false);
				child.removeMenu();
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
	tray.setToolTip(toolTip);
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

export function bar (repoLink: string, mainWindow: BrowserWindow, strings: lang, devMode: boolean): Menu {
	const webLink = repoLink.substring(repoLink.indexOf("+")+1);
	const devel = getDevel(devMode, configData.devel);
	const menu = Menu.buildFromTemplate([
		{ label: strings.menubar.file.groupName, submenu: [
			{
				label: strings.menubar.file.quit,
				accelerator: 'CommandOrControl+Q',
				click: () => {
					wantQuit=true;
					app.quit();
				}
			},
			{
				label: strings.menubar.file.relaunch,
				click: () => {
					wantQuit=true;
					app.relaunch();
					app.quit();
				}
			}
		]},
		{ role: 'editMenu', label: strings.menubar.edit},
		{ label: strings.menubar.view.groupName, submenu: [
			{ label: strings.menubar.view.reload, role: 'reload' },
			{ label: strings.menubar.view.forceReload, role: 'forceReload' },
			{ type: 'separator' },
			{
				label: strings.menubar.view.devTools,
				id: 'devTools',
				role: 'toggleDevTools',
				enabled: devel
			},
			{ type: 'separator' },
			{ label: strings.menubar.view.resetZoom, role: 'resetZoom' },
			{ label: strings.menubar.view.zoomIn, role: 'zoomIn' },
			{ label: strings.menubar.view.zoomOut, role: 'zoomOut' },
			{ type: 'separator' },
			{ label: strings.menubar.view.fullScreen, role: 'togglefullscreen' }
		]},
		{ role: 'windowMenu', label: strings.menubar.window},
		{ label: strings.menubar.options.groupName, submenu: [
			{
				label: strings.menubar.options.disableTray,
				type: 'checkbox', checked: appConfig.get('disableTray'),
				click: () => configSwitch('disableTray')
			},
			{
				label: strings.menubar.options.hideMenuBar,
				type: 'checkbox',
				checked: appConfig.get('hideMenuBar'),
				click: () => configSwitch('hideMenuBar', () => {
					if (appConfig.get('hideMenuBar')) {
						dialog.showMessageBoxSync({
							type: "warning",
							title: strings.dialog.warning,
							message: strings.dialog.hideMenuBar,
							buttons: [strings.dialog.buttons.continue]
						});
					}
				})
			},
			{
				label: strings.menubar.options.mobileMode,
				type: 'checkbox',
				checked: appConfig.get('mobileMode'),
				click: () => configSwitch('mobileMode', async () => {
					if (appConfig.get('mobileMode')) {
						const key = await mainWindow.webContents.insertCSS(".sidebar-2K8pFh{ width: 0px !important; }");
						globalVars.set('css1Key',key);
					} else {
						const undefinedKey:string|undefined = globalVars.get('css1Key');
						if(undefinedKey!==undefined) {
							const key:string=undefinedKey;
							mainWindow.webContents.removeInsertedCSS(key);
						}
					}
				})
			},
			{ type: 'separator' },
			{
				label: strings.menubar.options.develMode,
				type: 'checkbox', checked: devel,
				enabled: !devMode,
				click: () => {
					if (!appConfig.get('devel')) {
						const answer:number=dialog.showMessageBoxSync({
							type: "warning",
							title: strings.dialog.warning,
							message: strings.dialog.devel,
							buttons: [
								strings.dialog.buttons.yes,
								strings.dialog.buttons.no
							],
							cancelId: 1
						});
						if(answer===0) configSwitch('devel', () => {
							updateMenuBarItem('devTools', !devel);
						});
					} else {
						configSwitch('devel', () => {
							updateMenuBarItem('devTools', !devel);
						});
					}
				}
			},
			{ label: strings.menubar.options.csp.groupName, submenu: [
				{
					label: strings.menubar.enabled,
					type: 'checkbox',
					checked: !appConfig.get('csp.disabled'),
					click: () => configSwitch('csp.disabled', () => {
						updateMenuBarItem('csp-thirdparty', !appConfig.get('csp.disabled'));
					})
				},
				{
					label: strings.menubar.options.csp.thirdparty,
					id: 'csp-thirdparty',
					enabled: !appConfig.get('csp.disabled'),
					submenu: [
						{
							label: "Spotify",
							type: 'checkbox',
							checked: !appConfig.get('csp.thirdparty.spotify'),
							click: () => configSwitch('csp.thirdparty.spotify')
						},
						{
							label: strings.menubar.options.csp.gifProviders,
							type: 'checkbox',
							checked: !appConfig.get('csp.thirdparty.gif'),
							click: () => configSwitch('csp.thirdparty.gif')
						},
						{
							label: "hCaptcha",
							type: 'checkbox',
							checked: !appConfig.get('csp.thirdparty.hcaptcha'),
							click: () => configSwitch('csp.thirdparty.hcaptcha')
						}
					]
				}
			]}
		]},
		{ label: strings.help.groupName, role: 'help', submenu: [
			{ label: strings.help.about, role: 'about', click: function() { app.showAboutPanel();}},
			{ label: strings.help.repo, click: function() { shell.openExternal(webLink);} },
			{ label: strings.help.docs, click: function() { shell.openExternal(webLink+'#documentation');} },
			{ label: strings.help.bugs, click: function() { shell.openExternal(webLink+'/issues');} }
		]}
	]);
	Menu.setApplicationMenu(menu);
	return menu;
}