import { appInfo } from "../clientProperties";
import { AppConfig, WinStateKeeper } from "../configManager";
import { app, BrowserWindow, Tray, net, nativeImage, ipcMain } from "electron";
import * as getMenu from '../nativeMenus';
import { packageJson, discordFavicons } from '../../global';
import { discordContentSecurityPolicy } from '../cspTweaker';
import l10n from "../l10nSupport";
import { getUserAgent } from '../../modules/userAgent';
import { createHash } from 'crypto';
import { resolve } from "path";


const configData = (new AppConfig().get());

export default function createMainWindow(startHidden: boolean, l10nStrings: l10n["strings"]): BrowserWindow {

    // Some variable declarations

    let tray: Promise<Tray>;

    // Check the window state

    const mainWindowState = new WinStateKeeper('mainWindow');

    // Browser window

    const win = new BrowserWindow({
        title: app.getName(),
        minWidth: appInfo.minWinWidth,
        minHeight: appInfo.minWinHeight,
        height: mainWindowState.initState.height,
        width: mainWindowState.initState.width,
        backgroundColor: "#36393F",
        icon: appInfo.icon,
        show: false,
        webPreferences: {
            preload: app.getAppPath() + "/sources/app/renderer/preload/mainWindow.js",
            nodeIntegration: false,
            devTools: true, // Too usefull to be blocked.
        }
    });
    win.webContents.on('did-fail-load', (_event, errorCode) => {
        if(errorCode !== -106) return;
        win.loadFile(resolve(app.getAppPath(), 'sources/assets/web/html/404.html'));
        const retry = setInterval(() => {
            if (retry && net.isOnline()) {
                clearTimeout(retry);
                win.loadURL(appInfo.URL, { userAgent: getUserAgent(process.versions.chrome) });
            }
        }, 1000);
    });
    win.webContents.once('did-finish-load', () => {
        win.loadURL(appInfo.URL, { userAgent: getUserAgent(process.versions.chrome) });
        if (!startHidden) win.show();
    })
    if (mainWindowState.initState.isMaximized) win.maximize();

    // CSP

    if (configData.csp.enabled) {
        win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [discordContentSecurityPolicy]
                }
            });
        });
    }

    // (Device) permissions check/request handlers:
    {
        /** List of domains, urls or protocols accepted by permission handlers. */
        const trustedURLs = [
            appInfo.rootURL,
            'devtools://'
        ];
        win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
            let websiteURL: string;
            switch (permission) {
                case "display-capture":
                case "notifications":
                case "media":
                    break;
                default:
                    return false;
            }
            (webContents !== null && webContents.getURL() !== "") ? websiteURL = webContents.getURL() : websiteURL = requestingOrigin;
            // In some cases URL might be empty string, it should be denied then for that reason.
            if (websiteURL === "")
                return false;
            const originURL = new URL(websiteURL).origin;
            for (const secureURL of trustedURLs) {
                if (originURL.startsWith(secureURL)) {
                    return true;
                }
            }
            console.warn(`[${l10nStrings.dialog.common.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.check.denied}`, originURL, permission);
            return false;
        });
        win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
            for (const secureURL of trustedURLs) {
                switch (permission) {
                    case "display-capture":
                    case "notifications":
                    case "media":
                        break;
                    default:
                        return callback(false);
                }
                if (webContents.getURL().startsWith(secureURL)) {
                    return callback(true);
                }
            }
            console.warn(`[${l10nStrings.dialog.common.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.request.denied}`, webContents.getURL(), permission);
            return callback(false);
        });
        win.webContents.session.setDevicePermissionHandler(() => false);
    }
    win.loadFile(resolve(app.getAppPath(), 'sources/assets/web/html/load.html'));
    win.setAutoHideMenuBar(configData.hideMenuBar);
    win.setMenuBarVisibility(!configData.hideMenuBar);

    // Keep window state

    mainWindowState.watchState(win);

    // Load all menus:

    getMenu.context(win);
    if (!configData.disableTray) tray = getMenu.tray(win);
    getMenu.bar(packageJson.repository.url, win);

    // "Red dot" icon feature
    let setFavicon: string | undefined;
    win.webContents.once('did-finish-load', () => {
        win.webContents.on('page-favicon-updated', async (_event, favicons) => {
            const t = await tray;
            // Convert from DataURL to RAW.
            const faviconRaw = nativeImage.createFromDataURL(favicons[0]).toBitmap();
            // Hash discord favicon.
            const faviconHash = createHash('sha1').update(faviconRaw).digest('hex');
            // Stop execution when icon is same as the one set.
            if (faviconHash === setFavicon) return;

            // Compare hashes.
            if (!configData.disableTray) switch (faviconHash) {
                case discordFavicons.default:
                case discordFavicons.unread[0]:
                case discordFavicons.unread[1]:
                    setFavicon = faviconHash;
                    t.setImage(appInfo.trayIcon);
                    win.flashFrame(false);
                    break;
                default:
                    setFavicon = faviconHash;
                    t.setImage(appInfo.trayPing);
                    win.flashFrame(true);
            }
        });
    });

    // Window Title

    win.on('page-title-updated', (event: Event, title: string) => {
        if (title === "Discord") {
            event.preventDefault();
            win.setTitle(app.getName());
        }
    });

    // Animate menu

    win.webContents.on('did-finish-load', () => {
        win.webContents.insertCSS(".sidebar-2K8pFh{ transition: width .1s; transition-timing-function: linear;}");
    });

    // Inject desktop capturer
    ipcMain.on('desktop-capturer-inject', (event, api) => {
        const functionString = `
            navigator.mediaDevices.getDisplayMedia = async () => {
                return navigator.mediaDevices.getUserMedia(await window['${api}'].desktopCapturerPicker())
            }
        `;
        win.webContents.executeJavaScript(functionString + ';0');
    });

    return win;
}