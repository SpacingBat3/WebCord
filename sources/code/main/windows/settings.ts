import { ipcMain } from "electron/main";
import { AppConfig } from '../modules/config';
import { HTMLSettingsGroup, HTMLChecklistForms, HTMLChecklistOption, knownInstancesList, HTMLRadioForms } from '../../common/global';
import { appInfo, getBuildInfo } from '../modules/client';
import l10n from '../../common/modules/l10n';
import { initWindow } from "../modules/parent";

const appConfig = new AppConfig();

function instances2forms() {
	const instanceForms:HTMLRadioForms[] = []
	for(const instance of knownInstancesList)
		instanceForms.push({
			label: instance[0],
			value: knownInstancesList.indexOf(instance),
			isChecked: appConfig.get().currentInstance === knownInstancesList.indexOf(instance)
		})
	return instanceForms
}

function conf2html (config:AppConfig) {
	const lang = (new l10n()).client.settings;
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
		['audius', 'Audius'],
		['soundcloud', 'SoundCloud'],
		['reddit', 'Reddit']
	];
	const cspChecklist: HTMLChecklistForms[] = []
	for (const stringGroup of websitesThirdParty.sort()) {
		cspChecklist.push({
			label: stringGroup[1],
			id: "csp.thirdparty."+stringGroup[0],
			isChecked: (appConfig.get().csp.thirdparty as Record<string, boolean>)[stringGroup[0]]??false
		})
	}
	const csp: HTMLChecklistOption = {
		name: lang.advanced.group.csp.name+' – '+lang.advanced.group.csp.extends.thirdparty.name,
		description: lang.advanced.group.csp.extends.thirdparty.description,
		type: 'checkbox',
		forms: cspChecklist
	}
	// Basic / general
	const general:HTMLSettingsGroup = {
		title: lang.basic.name,
		options: [
			{
				// Hide menu bar
				name: lang.basic.group.menuBar.name,
				description: lang.basic.group.menuBar.description,
				type: 'checkbox',
				forms: [
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
				type: 'checkbox',
				forms: [
					{
						label: lang.basic.group.tray.label,
						isChecked: config.get().disableTray,
						id: 'disableTray'
					}
				]
			}
		]
	}
	// Privacy
	const privacy:HTMLSettingsGroup = {
		title: lang.privacy.name,
		options: [
			{
				name: lang.privacy.group.blockApi.name,
				description: lang.privacy.group.blockApi.description,
				type: 'checkbox',
				forms: [
					{
						label: lang.privacy.group.blockApi.label.science,
						id: 'blockApi.science',
						isChecked: config.get().blockApi.science
					},
					{
						label: lang.privacy.group.blockApi.label.typingIndicator,
						id: 'blockApi.typingIndicator',
						isChecked: config.get().blockApi.typingIndicator
					},
					{
						label: lang.privacy.group.blockApi.label.fingerprinting,
						id: 'blockApi.fingerprinting',
						isChecked: config.get().blockApi.fingerprinting
					}
				]
			},
			{
				name: lang.privacy.group.permissions.name,
				description: lang.privacy.group.permissions.description,
				type: 'checkbox',
				forms: [
					{
						label: lang.privacy.group.permissions.label.camera,
						id: 'permissions.video',
						isChecked: config.get().permissions.video
					},
					{
						label: lang.privacy.group.permissions.label.microphone,
						id: 'permissions.audio',
						isChecked: config.get().permissions.audio
					},
					{
						label: lang.privacy.group.permissions.label.fullscreen,
						id: 'permissions.fullscreen',
						isChecked: config.get().permissions.fullscreen
					},
					{
						label: lang.privacy.group.permissions.label.desktopCapture,
						id: 'permissions.display-capture',
						isChecked: config.get().permissions["display-capture"]
					},
					{
						label: lang.privacy.group.permissions.label.notifications,
						id: 'permissions.notifications',
						isChecked: config.get().permissions.notifications
					}
				]
			}
		]
	}
	// Advanced
	const advanced:HTMLSettingsGroup = {
		title: lang.advanced.name,
		options: [
			{
				...lang.advanced.group.instance,
				type: 'radio',
				id: 'currentInstance',
				forms: instances2forms()
			},
			{
				// Enable CSP
				name: lang.advanced.group.csp.name,
				description: lang.advanced.group.csp.extends.enable.description,
				type: 'checkbox',
				forms: [{
					label: lang.advanced.group.csp.extends.enable.label,
					id: 'csp.enabled',
					isChecked: config.get().csp.enabled
				}],
			},
			csp,
			{
				name: lang.advanced.group.crossOrigin.name,
				description: lang.advanced.group.crossOrigin.description,
				type: 'checkbox',
				forms: [{
					label: lang.advanced.group.crossOrigin.label,
					id: 'redirectionWarning',
					isChecked: config.get().redirectionWarning
				}]
			},
			{
				// Developer mode
				name: lang.advanced.group.devel.name,
				description: lang.advanced.group.devel.description,
				type: 'checkbox',
				hidden: getBuildInfo().type === "devel",
				forms: [{
					label: lang.advanced.group.devel.label,
					id: 'devel',
					isChecked: config.get().devel
				}],
			},
			{
				// Developer mode
				name: lang.advanced.group.optimize.name,
				description: lang.advanced.group.optimize.description,
				type: 'checkbox',
				forms: [
					{
						label: lang.advanced.group.optimize.checklist.gpu,
						id: 'useRecommendedFlags.gpu',
						isChecked: config.get().useRecommendedFlags.gpu
					}
				],
			}
		]
	}
	return [general, privacy, advanced];
}

export default function loadSettingsWindow(parent:Electron.BrowserWindow):Electron.BrowserWindow|void {
	const configWithStrings = conf2html(appConfig);
	if(!parent.isVisible()) parent.show();
	const settingsWindow = initWindow("settings", parent, {
		minWidth: appInfo.minWinWidth,
		minHeight: appInfo.minWinHeight,
	})
	if(settingsWindow === undefined) return;
	ipcMain.on('settings-generate-html', (event) => { 
		if(!settingsWindow.isDestroyed()) settingsWindow.show();
		event.reply('settings-generate-html', configWithStrings)
	})
    return settingsWindow;
}

ipcMain.on('settings-config-modified', (_event, config:AppConfig["defaultConfig"])=> {
	appConfig.set(config);
})