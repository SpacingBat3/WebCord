import { app, ipcMain, BrowserWindow, session } from "electron";
import { AppConfig } from '../modules/config';
import { HTMLSettingsGroup, HTMLChecklistForms, HTMLChecklistOption, knownIstancesList, HTMLRadioForms } from '../../global';
import { appInfo, getBuildInfo } from '../modules/client';
import l10n from '../../modules/l10n';

const appConfig = new AppConfig();

function instances2forms() {
	const instanceForms:HTMLRadioForms[] = []
	for(const instance in knownIstancesList)
		instanceForms.push({
			label: knownIstancesList[instance][0],
			value: parseInt(instance),
			isChecked: appConfig.get().currentInstance === parseInt(instance)
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
		['funimation', 'Funimation'],
		['audius', 'Audius'],
		['soundcloud', 'SoundCloud'],
		['reddit', 'Reddit']
	];
	const cspChecklist: HTMLChecklistForms[] = []
	for (const stringGroup of websitesThirdParty.sort()) {
		cspChecklist.push({
			label: stringGroup[1],
			id: "csp.thirdparty."+stringGroup[0],
			isChecked: (appConfig.get().csp.thirdparty as Record<string, boolean>)[stringGroup[0]]
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
						isChecked: config.get().permissions.video
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
			}
		]
	}
	return [general, privacy, advanced];
}

export default function loadSettingsWindow(parent:BrowserWindow):BrowserWindow {
	const strings = (new l10n().client);
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
			preload: app.getAppPath()+"/sources/app/renderer/preload/settings.js",
			defaultFontFamily: {
                standard: 'Arial' // `sans-serif` as default font.
            }
		}
	});
	if(settingsWindow.webContents.session === parent.webContents.session)
        throw new Error("Child took session from parent!")
	settingsWindow.setAutoHideMenuBar(true);
    settingsWindow.setMenuBarVisibility(false);
    if(getBuildInfo().type === 'release') settingsWindow.removeMenu();
	settingsWindow.webContents.loadFile('sources/assets/web/html/settings.html');
	ipcMain.on('settings-generate-html', (event) => { 
		if(!settingsWindow.isDestroyed()) settingsWindow.show();
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