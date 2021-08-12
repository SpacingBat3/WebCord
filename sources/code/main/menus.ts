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
	clipboard,
	WebContents,
	ipcMain
} from 'electron';

import {
	getDevel,
	guessDevel,
	appInfo
} from './properties';

import { AppConfig } from './config'

const appConfig = new AppConfig()

import { loadNodeAddons, loadChromeAddons } from '../internalModules/addonLoader';

import fetch from 'electron-fetch';
import * as os from 'os';
import * as EventEmitter from 'events';
import { createGithubIssue } from '../internalModules/bugReporter';
import { TranslatedStrings } from './lang';

const sideBar = new EventEmitter();
const { devel } = guessDevel();

sideBar.on('hide', async (contents: WebContents) => {
	const cssKey = await contents.insertCSS(".sidebar-2K8pFh{ width: 0px !important; }");
	sideBar.once('show', () => {
		contents.removeInsertedCSS(cssKey);
	});
});

let wantQuit = false;

function configSwitch(value: string, command?: (newValue?: boolean) => void): void {
	let newValue:boolean;
	if (appConfig.hasProperty(value)) {
		appConfig.setProperty(value, !appConfig.getProperty(value));
		newValue = !appConfig.getProperty(value);
	} else {
		appConfig.setProperty(value, true);
		newValue = true
	}
	if (command) command(newValue);
}

function updateMenuBarItem(id: string, value: boolean): void {
	const applicationMenu = Menu.getApplicationMenu();
	if (applicationMenu !== null) {
		const menuitem = applicationMenu.getMenuItemById(id);
		if (menuitem !== null) menuitem.enabled = value;
	}
}

// Contex Menu with spell checker

export function context(windowName: BrowserWindow): void {
	const strings = new TranslatedStrings();
	windowName.webContents.on('context-menu', (event, params) => {
		const cmenu: (MenuItemConstructorOptions | MenuItem)[] = [
			{ type: 'separator' },
			{ label: strings.context.cut, role: 'cut', enabled: params.editFlags.canCut },
			{ label: strings.context.copy, role: 'copy', enabled: params.editFlags.canCopy },
			{ label: strings.context.paste, role: 'paste', enabled: params.editFlags.canPaste },
			{ type: 'separator' }
		];
		let position = 0;
		for (const suggestion of params.dictionarySuggestions) {
			cmenu.splice(++position, 0, {
				label: suggestion,
				click: () => windowName.webContents.replaceMisspelling(suggestion)
			});
		}
		if (params.misspelledWord) {
			cmenu.splice(++position, 0, { type: 'separator' });
			cmenu.splice(++position, 0, {
				label: strings.context.dictionaryAdd,
				click: () => windowName.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
			});
			cmenu.splice(++position, 0, { type: 'separator' });
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
			cmenu.push({ type: 'separator' });
		}
		if (getDevel(devel, appConfig.get().devel)) {
			cmenu.push({
				label: strings.context.inspectElement,
				click: () => windowName.webContents.inspectElement(params.x, params.y)
			});
			cmenu.push({ type: 'separator' });
		}
		Menu.buildFromTemplate(cmenu).popup({
			window: windowName,
			x: params.x,
			y: params.y
		});
	});
}

let funMode = 0;
const today = new Date();
if (os.userInfo().username == 'spacingbat3' || (today.getDate() == 1 && today.getMonth() == 3)) {
	funMode = 1; // There's always fun for me ;)
} else if (os.userInfo().username == 'pi' && today.getDate() == 14 && today.getMonth() == 2) {
	funMode = 2; // Happy π day!
}

// Tray menu

export async function tray(windowName: BrowserWindow, childCSP: string): Promise<Tray> {
	const strings = new TranslatedStrings();
	const tray = new Tray(appInfo.trayIcon);
	let image: string | nativeImage;
	if (funMode === 2) {
		image = nativeImage.createFromBuffer(await (await fetch('https://raw.githubusercontent.com/iiiypuk/rpi-icon/master/16.png')).buffer());
	} else {
		image = nativeImage.createFromPath(appInfo.trayIcon).resize({ width: 16 });
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
				});
				if (appConfig.get().csp.disabled) {
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
			click: function () { app.showAboutPanel(); }
		},
		{
			label: strings.help.bugs,
			click: createGithubIssue
		},
		{ type: 'separator' },
		{
			label: strings.tray.toggle,
			click: function () {
				windowName.isVisible() ? windowName.hide() : windowName.show();
			}
		},
		{
			label: strings.tray.quit,
			click: function () {
				wantQuit = true;
				app.quit();
			}
		}
	]);
	tray.setContextMenu(contextMenu);
	tray.setToolTip(app.getName());
	// Exit to the tray
	windowName.on('close', (event) => {
		if (!wantQuit) {
			event.preventDefault();
			windowName.hide();
		}
	});
	return tray;
}

// Menu Bar

export function bar(repoLink: string, mainWindow: BrowserWindow): Menu {
	const strings = new TranslatedStrings();
	const webLink = repoLink.substring(repoLink.indexOf("+") + 1);
	const devMode = getDevel(devel, appConfig.get().devel);

	const csp: MenuItem | MenuItemConstructorOptions[] = [];
	const websitesThirdParty: [string, string][] = [
		['algolia', 'Algolia'],
		['spotify', 'Spotify'],
		['hcaptcha', 'hCaptcha'],
		['paypal', 'PayPal'],
		['gif', strings.menubar.file.options.csp.gifProviders],
		['youtube', 'YouTube'],
		['twitter', 'Twitter'],
		['twitch', 'Twitch'],
		['streamable', 'Streamable'],
		['vimeo', 'Vimeo'],
		['funimation', 'Funimation'],
		['audius', 'Audius'],
		['soundcloud', 'SoundCloud']
	];
	for (const website of websitesThirdParty.sort()) {
		csp.push({
			label: website[1],
			type: 'checkbox',
			checked: !appConfig.getProperty('csp.thirdparty.' + website[0]),
			click: function () { return configSwitch('csp.thirdparty.' + website[0]); }
		});
	}

	const menu = Menu.buildFromTemplate([
		// File
		{
			label: strings.menubar.file.groupName, submenu: [
				// Settings (new)
				{
					label: strings.menubar.file.options.groupName + " (new)",
					click: () => {
						ipcMain.emit("settings");
					}
				},
				// Settings (old)
				{
					label: strings.menubar.file.options.groupName + " (deprecated)", submenu: [
						// Menu Bar visibility
						{
							label: strings.menubar.file.options.hideMenuBar,
							type: 'checkbox',
							checked: appConfig.get().hideMenuBar,
							click: () => configSwitch('hideMenuBar', () => {
								if (appConfig.get().hideMenuBar) {
									dialog.showMessageBoxSync({
										type: "warning",
										title: strings.dialog.warning,
										message: strings.dialog.hideMenuBar,
										buttons: [strings.dialog.buttons.continue]
									});
								}
							})
						},
						// Tray feature
						{
							label: strings.menubar.file.options.disableTray,
							type: 'checkbox', checked: appConfig.get().disableTray,
							click: () => configSwitch('disableTray')
						},
						{ type: 'separator' },
						// Content Security Policy
						{
							label: strings.menubar.file.options.csp.groupName, submenu: [
								{
									label: strings.menubar.enabled,
									type: 'checkbox',
									checked: !appConfig.get().csp.disabled,
									click: () => configSwitch('csp.disabled', () => {
										updateMenuBarItem('csp-thirdparty', !appConfig.get().csp.disabled);
									})
								},
								{
									label: strings.menubar.file.options.csp.thirdparty,
									id: 'csp-thirdparty',
									enabled: !appConfig.get().csp.disabled,
									submenu: csp
								}
							]
						},
						// "Developer mode" switch
						{
							label: strings.menubar.file.options.develMode,
							type: 'checkbox', checked: devMode,
							enabled: !devMode,
							click: () => {
								if (!appConfig.get().devel) {
									const answer: number = dialog.showMessageBoxSync({
										type: "warning",
										title: strings.dialog.warning,
										message: strings.dialog.devel,
										buttons: [
											strings.dialog.buttons.yes,
											strings.dialog.buttons.no
										],
										cancelId: 1
									});
									if (answer === 0) configSwitch('devel', () => {
										updateMenuBarItem('devTools', !devMode);
									});
								} else {
									configSwitch('devel', () => {
										updateMenuBarItem('devTools', !devMode);
									});
								}
							}
						}
					]
				},
				// Extensions (Work In Progress state)
				{
					label: strings.menubar.file.addon.groupName, visible: devMode, submenu: [
						// Node-based extensions
						{
							label: strings.menubar.file.addon.loadNode,
							enabled: devel,
							click: () => { loadNodeAddons(mainWindow); }
						},
						// Chrome/Chromium extensions
						{
							label: strings.menubar.file.addon.loadChrome,
							enabled: devel,
							click: () => { loadChromeAddons(mainWindow); }
						}
					]
				},
				{ type: 'separator' },
				// Reset
				{
					label: strings.menubar.file.relaunch,
					click: () => {
						wantQuit = true;
						app.relaunch();
						app.quit();
					}
				},
				// Quit
				{
					label: strings.menubar.file.quit,
					accelerator: 'CmdOrCtrl+Q',
					click: () => {
						wantQuit = true;
						app.quit();
					}
				}
			]
		},
		// Edit
		{ role: 'editMenu', label: strings.menubar.edit },
		// View
		{
			label: strings.menubar.view.groupName, submenu: [
				// Reload
				{ label: strings.menubar.view.reload, role: 'reload' },
				// Force reload
				{ label: strings.menubar.view.forceReload, role: 'forceReload' },
				{ type: 'separator' },
				// DevTools
				{
					label: strings.menubar.view.devTools,
					id: 'devTools',
					role: 'toggleDevTools',
					enabled: devMode
				},
				{ type: 'separator' },
				// Zoom settings (reset, zoom in, zoom out)
				{ label: strings.menubar.view.resetZoom, role: 'resetZoom' },
				{ label: strings.menubar.view.zoomIn, role: 'zoomIn' },
				{ label: strings.menubar.view.zoomOut, role: 'zoomOut' },
				{ type: 'separator' },
				// Toggle full screen
				{ label: strings.menubar.view.fullScreen, role: 'togglefullscreen' }
			]
		},
		// Window
		{
			label: strings.menubar.window, submenu: [
				// Hide side bar
				{
					label: strings.menubar.file.options.mobileMode,
					type: 'checkbox',
					accelerator: 'CmdOrCtrl+Alt+M',
					checked: false,
					click: () => configSwitch('mobileMode', async () => {
						if ((sideBar.listenerCount('show') + sideBar.listenerCount('hide')) > 1) {
							sideBar.emit('show');
						} else {
							sideBar.emit('hide', mainWindow.webContents);
						}
					})
				}
			]
		},
		// Help
		{
			label: strings.help.groupName, role: 'help', submenu: [
				// About
				{ label: strings.help.about, role: 'about', click: function () { app.showAboutPanel(); } },
				// Repository
				{ label: strings.help.repo, click: function () { shell.openExternal(webLink); } },
				// Documentation
				{ label: strings.help.docs, click: function () { shell.openExternal(webLink + '#documentation'); } },
				// Report a bug
				{ label: strings.help.bugs, click: createGithubIssue }
			]
		}
	]);
	Menu.setApplicationMenu(menu);
	return menu;
}