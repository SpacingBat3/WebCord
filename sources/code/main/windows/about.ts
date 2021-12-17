//import { packageJson } from '../../global';
import { app, BrowserWindow, ipcMain as ipc } from 'electron';
import { resolve } from "path";
import { appInfo, getBuildInfo } from '../modules/client';
//import l10n from '../../modules/l10n';

// "About" Panel:

export default function showAboutPanel(parent:BrowserWindow): void {
    const aboutPanel = new BrowserWindow ({
        width: 600,
        height: 480,
        resizable: false,
        frame: false,
        show: true,
        parent,
        backgroundColor: appInfo.backgroundColor,
        webPreferences: {
            preload: resolve(app.getAppPath(), "sources/app/renderer/preload/about.js")
        }
    });
    aboutPanel.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/about.html"));
    ipc.once("about.close", () => {
        aboutPanel.close();
    });
    ipc.on("about.getDetails", (event) => {
        event.reply("about.getDetails", {
            appName: app.getName(),
            appVersion: app.getVersion(),
            buildInfo: getBuildInfo()
        });
    });
    ipc.once("about.readyToShow", () => aboutPanel.show());
}