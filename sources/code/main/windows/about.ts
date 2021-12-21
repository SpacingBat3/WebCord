//import { packageJson } from '../../global';
import { app, BrowserWindow, ipcMain as ipc, screen, session } from 'electron';
import { resolve } from "path";
import { appInfo, getBuildInfo } from '../modules/client';
//import l10n from '../../modules/l10n';

// "About" Panel:

export default async function showAboutPanel(parent:BrowserWindow): Promise<BrowserWindow|undefined> {
    if(!app.isReady) await app.whenReady();
    console.dir(parent.getChildWindows().length)
    if(parent.getChildWindows().length !== 0) return;
    const screenBounds = screen.getPrimaryDisplay().size
    const resizable = process.platform === "linux" &&
        /^arm(?:64|v\d)?$/.test(process.arch) &&
        process.env.WEBCORD_EXPERIMENTAL_ABOUT_MOBILEUI === "true";
    const [width, height] = [
        (screenBounds.width < 600 ? screenBounds.width : 600),
        (screenBounds.height < 480 ? screenBounds.height : 480)
    ]
    if(!parent.isVisible()) parent.show();
    const aboutPanel = new BrowserWindow ({
        width,
        height,
        resizable,
        fullscreenable: resizable,
        frame: resizable,
        show: false,
        parent,
        modal: true,
        backgroundColor: appInfo.backgroundColor,
        icon: appInfo.icon,
        webPreferences: {
            session: session.fromPartition("temp:about"),
            preload: resolve(app.getAppPath(), "sources/app/renderer/preload/about.js"),
            defaultFontFamily: {
                standard: 'Arial' // `sans-serif` as default font.
            }
        }
    });
    aboutPanel.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/about.html"));
    aboutPanel.setAutoHideMenuBar(true);
    aboutPanel.setMenuBarVisibility(false);
    if (getBuildInfo().type !== "devel") aboutPanel.removeMenu();
    ipc.once("about.close", () => {
        if(!aboutPanel.isDestroyed()) aboutPanel.close();
    });
    ipc.once("about.readyToShow", () => {
        if(!aboutPanel.isDestroyed()) aboutPanel.show()
    });
    ipc.on("about.getDetails", (event) => {
        event.reply("about.getDetails", {
            appName: app.getName(),
            appVersion: app.getVersion(),
            buildInfo: getBuildInfo()
        });
    });
    return aboutPanel;
}