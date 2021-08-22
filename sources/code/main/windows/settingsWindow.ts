import { app, ipcMain, BrowserWindow } from "electron";
import { AppConfig } from '../config';
import { HTMLSettingsGroup } from '../../global';
import { appInfo } from '../properties';
import TranslatedStrings from '../lang';
import * as deepmerge from 'deepmerge';

const appConfig = new AppConfig();

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

export default function loadSettingsWindow(parent:BrowserWindow):BrowserWindow {
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
    return settingsView;
}

ipcMain.on('settings-config-modified', (_event, config:AppConfig["defaultConfig"])=> {
	appConfig.set(config);
})