/*
 * Menu Objects (menus.ts)
 */
import {
	app,
	Menu,
	BrowserWindow,
	MenuItem,
	Tray,
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

import { loadNodeAddons, loadChromeAddons } from '../main/mod';
import fetch from 'electron-fetch';
import * as os from 'os';
import { EventEmitter } from 'events';
import { createGithubIssue } from '../internalModules/bugReporter';
import TranslatedStrings from './lang';
import { HTMLSettingsGroup } from '../global';
import deepmerge = require('deepmerge');

const sideBar = new EventEmitter();
const { devel } = guessDevel();

sideBar.on('hide', async (contents: WebContents) => {
	const cssKey = await contents.insertCSS(".sidebar-2K8pFh{ width: 0px !important; }");
	sideBar.once('show', () => {
		contents.removeInsertedCSS(cssKey);
	});
});

let wantQuit = false;

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
				windowName.show();
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

function conf2html (config:AppConfig) {
	const strings = new TranslatedStrings();
	const lang = strings.settings;
	const websitesThirdParty: [string, string][] = [
		['algolia', 'Algolia'],
		['spotify', 'Spotify'],
		['hcaptcha', 'hCaptcha'],
		['paypal', 'PayPal'],
		['gif', strings.settings.advanced.group.csp.group.thirdparty.list.gifProviders],
		['youtube', 'YouTube'],
		['twitter', 'Twitter'],
		['twitch', 'Twitch'],
		['streamable', 'Streamable'],
		['vimeo', 'Vimeo'],
		['funimation', 'Funimation'],
		['audius', 'Audius'],
		['soundcloud', 'SoundCloud']
	];
	const cspChecklist: HTMLSettingsGroup["options"][0]["checklists"] = []
	for (const stringGroup of websitesThirdParty) {
		cspChecklist.push({
			label: stringGroup[1],
			id: "csp-thirdparty."+stringGroup[0],
			isChecked: (appConfig.get().csp.thirdparty as Record<string, boolean>)[stringGroup[0]]
		})
	}
	const csp: HTMLSettingsGroup = {
		title: strings.settings.advanced.name,
		options: [
			{
				name: strings.settings.advanced.group.csp.name,
				description: strings.settings.advanced.group.csp.description,
				checklists: cspChecklist
			}
		]
	}
	const general:HTMLSettingsGroup = {
		title: lang.basic.name,
		options: [
			{
				name: lang.basic.group.menuBar.name,
				description: lang.basic.group.menuBar.description,
				checklists: [
					{
						label: lang.basic.group.menuBar.label,
						isChecked: config.get().hideMenuBar,
						id: 'hideMenuBar'
					}
				]
			},
			{
				name: lang.basic.group.tray.name,
				description: lang.basic.group.tray.description,
				checklists: [
					{
						label: lang.basic.group.tray.label,
						isChecked: config.get().disableTray,
						id: 'disableTray'
					}
				]
			}
		]
	}
	const advanced:HTMLSettingsGroup = deepmerge(csp, {
		title: lang.advanced.name,
		options: [
			{
				name: lang.advanced.group.devel.name,
				description: lang.advanced.group.devel.description,
				checklists: [
					{
						label: lang.advanced.group.devel.label,
						id: 'devel',
						isChecked: config.get().devel
					}
				],
			}
		]
	});
	return [general, advanced];
}

function loadSettingsWindow(parent:BrowserWindow) {
	const strings = (new TranslatedStrings());
	const configWithStrings = conf2html(appConfig);
	const settingsView = new BrowserWindow({
		title: app.getName()+" – "+strings.settings.title,
		icon: appInfo.icon,
		show: false,
		backgroundColor: "#36393F",
		parent: parent,
		webPreferences: {
			preload: app.getAppPath()+"/sources/app/renderer/preload/settings.js"
		}
	});
	settingsView.removeMenu();
	settingsView.webContents.loadFile('sources/assets/web/html/settings.html');
	ipcMain.once('settings-generate-html', (event, message:string) => { 
		if(message === "ready-to-render") {
			settingsView.show();
			event.reply('settings-generate-html', configWithStrings)
		} else {
			console.error("Renderer process send message: '%s', that is not understood by main process.", message)
		}
	})
}

ipcMain.on('settings-config-modified', (_event, config:AppConfig["defaultConfig"])=> {
	appConfig.set(config);
})

// Menu Bar

export function bar(repoLink: string, mainWindow: BrowserWindow): Menu {
	const strings = new TranslatedStrings();
	const webLink = repoLink.substring(repoLink.indexOf("+") + 1);
	const devMode = getDevel(devel, appConfig.get().devel);
	const menu = Menu.buildFromTemplate([
		// File
		{
			label: strings.menubar.file.groupName, submenu: [
				// Settings
				{
					label: strings.settings.title,
					click: () => loadSettingsWindow(mainWindow)
				},
				// Extensions (Work In Progress state)
				{
					label: strings.menubar.file.addon.groupName, visible: devMode, submenu: [
						// Node-based extensions
						{
							label: strings.menubar.file.addon.loadNode,
							enabled: devel,
							click: () => loadNodeAddons(mainWindow)
						},
						// Chrome/Chromium extensions
						{
							label: strings.menubar.file.addon.loadChrome,
							enabled: devel,
							click: () => loadChromeAddons(mainWindow)
						}
					]
				},
				{ type: 'separator' },
				// Reset
				{
					label: strings.menubar.file.relaunch,
					accelerator: 'CmdOrCtrl+Alt+R',
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
		// Help
		{
			label: strings.help.groupName, role: 'help', submenu: [
				// About
				{ label: strings.help.about, role: 'about', click: () => app.showAboutPanel() },
				// Repository
				{ label: strings.help.repo, click: () => shell.openExternal(webLink) },
				// Documentation
				{ label: strings.help.docs, click: () => shell.openExternal(webLink + '#documentation') },
				// Report a bug
				{ label: strings.help.bugs, click: createGithubIssue }
			]
		}
	]);
	Menu.setApplicationMenu(menu);
	return menu;
}