/*
 * nativeMenus – OS native menus (tray menu, context menu, menu bar etc.)
 */
import {
	app,
	Menu,
	BrowserWindow,
	MenuItem,
	Tray,
	shell,
	nativeImage, // Static methods, that initializes class (NativeImage).
	NativeImage, // Class, used after initialization and for types.
	MenuItemConstructorOptions,
	clipboard,
	WebContents,
	session
} from 'electron';

import {
	getDevel,
	getBuildInfo,
	appInfo
} from './clientProperties';

import { AppConfig } from './configManager';

const appConfig = new AppConfig()

import { loadNodeAddons, loadChromeAddons } from './addonsLoader';
import fetch from 'electron-fetch';
import * as os from 'os';
import { EventEmitter } from 'events';
import { createGithubIssue } from '../modules/bugReporter';
import l10n from './l10nSupport';
import loadSettingsWindow from './windows/settingsWindow';
import loadDocsWindow from './windows/docsViewer';

const sideBar = new EventEmitter();
const devel = getBuildInfo().type === 'devel';

sideBar.on('hide', async (contents: WebContents) => {
	const cssKey = await contents.insertCSS(".sidebar-2K8pFh{ width: 0px !important; }");
	sideBar.once('show', () => {
		contents.removeInsertedCSS(cssKey);
	});
});

let wantQuit = false;

// Contex Menu with spell checker

export function context(windowName: BrowserWindow): void {
	const strings = (new l10n()).strings;
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

export async function tray(windowName: BrowserWindow): Promise<Tray> {
	const strings = (new l10n()).strings;
	const tray = new Tray(appInfo.trayIcon);
	let image: string | NativeImage;
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
						session: session.fromPartition("temp:fun"),
						disableBlinkFeatures: "AuxClick"
					}
				});
				child.webContents.session.webRequest.onHeadersReceived((details, callback) => {
					callback({
						responseHeaders: {
							...details.responseHeaders,
							'Content-Security-Policy': [
								"default-src 'self' blob:;"+
								" style-src 'sha256-n8V3/om6O5hiSDvdAJRQZROksW9j13D3/OdUsUXCN6E=';"+
								" script-src 'unsafe-inline'"+
								" https://jcw87.github.io"
							]
						}
					});
				});
				child.loadURL('https://jcw87.github.io/c2-sans-fight/');
				child.on('page-title-updated', (event) => {
					event.preventDefault();
				});
				child.setAutoHideMenuBar(true);
				child.setMenuBarVisibility(false);
				child.webContents.session.setPermissionCheckHandler(() => false);
				child.webContents.session.setPermissionRequestHandler((_webContents,_permission,callback) => {
					callback(false);
				});
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
				if(windowName.isVisible() && windowName.isFocused())
					windowName.hide()
				else {
					!windowName.isVisible() && windowName.show();
					!windowName.isFocused() && windowName.focus();
				}
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
	const strings = (new l10n()).strings;
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
						const newArgs:string[] = [];
						for (const arg of process.argv) {
							let willBreak = false;
							for (const sw of ['start-minimized', 'm'])
								if(arg.includes('-') && arg.endsWith(sw)) {
									willBreak = true;
									break;
								}
							if (willBreak) break;
							newArgs.push(arg);
						}
						newArgs.shift();
						app.relaunch({
							args: newArgs, 
						});
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
			label: strings.menubar.window.groupName, submenu: [
			// Hide side bar
			{
				label: strings.menubar.window.mobileMode,
				type: 'checkbox',
				accelerator: 'CmdOrCtrl+Alt+M',
				checked: false,
				click: async () => {
					if ((sideBar.listenerCount('show') + sideBar.listenerCount('hide')) > 1) {
						sideBar.emit('show');
					} else {
						sideBar.emit('hide', mainWindow.webContents);
					}
				}
			}
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
				{ label: strings.help.docs, click: () => loadDocsWindow(mainWindow) },
				// Report a bug
				{ label: strings.help.bugs, click: createGithubIssue }
			]
		}
	]);
	Menu.setApplicationMenu(menu);
	return menu;
}