import { app, ipcMain, BrowserWindow, session } from "electron";
import { AppConfig } from '../configManager';
import { HTMLSettingsGroup } from '../../global';
import { appInfo, getBuildInfo } from '../clientProperties';
import l10n from '../l10nSupport';
import { deepmerge } from 'deepmerge-ts';

const appConfig = new AppConfig();

function conf2html (config:AppConfig) {
	const lang = (new l10n()).strings.settings;
	const websitesThirdParty: [string, string][] = [
		['algolia', 'Algolia'],
		['spotify', 'Spotify'],
		['hcaptcha', 'hCaptcha'],
		['paypal', 'PayPal'],
		['gif', lang.advanced.group.csp.extends.thirdparty.list.gifProviders],
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
		title: lang.advanced.name,
		options: [
			{
				name: lang.advanced.group.csp.name+' – '+lang.advanced.group.csp.extends.thirdparty.name,
				description: lang.advanced.group.csp.extends.thirdparty.description,
				checklists: cspChecklist
			}
		]
	}
	// Basic / general
	const general:HTMLSettingsGroup = {
		title: lang.basic.name,
		options: [
			{
				// Hide menu bar
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
				// Disable tray
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
	// Advanced
	const advanced:HTMLSettingsGroup = deepmerge({
		title: lang.advanced.name,
		options: [
			{
				// Enable CSP
				name: lang.advanced.group.csp.name,
				description: lang.advanced.group.csp.extends.enable.description,
				checklists: [
					{
						label: lang.advanced.group.csp.extends.enable.label,
						id: 'csp.enabled',
						isChecked: config.get().csp.enabled
					}
				],
			}
		]
	}, csp, {
		title: lang.advanced.name,
		options: [
			{
				// Developer mode
				name: lang.advanced.group.devel.name,
				description: lang.advanced.group.devel.description,
				hidden: getBuildInfo().type === "devel",
				checklists: [
					{
						label: lang.advanced.group.devel.label,
						id: 'devel',
						isChecked: config.get().devel
					}
				],
			}
		]
	})
	console.dir(advanced)
	return [general, advanced];
}

export default function loadSettingsWindow(parent:BrowserWindow):BrowserWindow {
	const strings = (new l10n().strings);
	const configWithStrings = conf2html(appConfig);
	const settingsWindow = new BrowserWindow({
		title: app.getName()+" – "+strings.settings.title,
		icon: appInfo.icon,
		show: false,
		backgroundColor: "#36393F",
		parent: parent,
		minWidth: appInfo.minWinWidth,
		minHeight: appInfo.minWinHeight,
		webPreferences: {
			session: session.fromPartition("temp:settings"),
			preload: app.getAppPath()+"/sources/app/renderer/preload/settings.js"
		}
	});
	if(settingsWindow.webContents.session === parent.webContents.session)
        throw new Error("Child took session from parent!")
	settingsWindow.removeMenu();
	settingsWindow.webContents.loadFile('sources/assets/web/html/settings.html');
	ipcMain.on('settings-generate-html', (event) => { 
		if(!settingsWindow.isDestroyed()) settingsWindow.show();
		console.dir(configWithStrings[1].options)
		event.reply('settings-generate-html', configWithStrings)
	})
	settingsWindow.webContents.session.setPermissionCheckHandler(() => false);
	settingsWindow.webContents.session.setPermissionRequestHandler((_webContents,_permission,callback) => {
        return callback(false);
    });
	settingsWindow.webContents.session.setDevicePermissionHandler(()=> false);
    return settingsWindow;
}

ipcMain.on('settings-config-modified', (_event, config:AppConfig["defaultConfig"])=> {
	appConfig.set(config);
})