//import { packageJson } from '../../global';
import { app, BrowserWindow, ipcMain as ipc, screen } from 'electron';
import { getBuildInfo } from '../modules/client';
import { initWindow } from '../modules/parent';
//import l10n from '../../global/modules/l10n';

// "About" Panel:

export default function showAboutPanel(parent:BrowserWindow): BrowserWindow|undefined {
    const screenBounds = screen.getPrimaryDisplay().size
    const [width, height] = [
        (screenBounds.width < 600 ? screenBounds.width : 600),
        (screenBounds.height < 480 ? screenBounds.height : 480)
    ]
    const aboutPanel = initWindow("about", parent, {
        width,
        height,
        resizable: false,
        fullscreenable: false,
        frame: false
    });
    if(aboutPanel === undefined) return;
    ipc.once("about.close", () => {
        if(!aboutPanel.isDestroyed()) aboutPanel.close();
    });
    ipc.once("about.readyToShow", () => {
        if(!aboutPanel.isDestroyed())
            aboutPanel.show();
    });
    ipc.on("about.getDetails", (event) => {
        if(!aboutPanel.isDestroyed())
            event.reply("about.getDetails", {
                appName: app.getName(),
                appVersion: app.getVersion(),
                buildInfo: getBuildInfo()
            });
    });
    aboutPanel.once("close", () => {
        ipc.removeAllListeners("about.getDetails");
        ipc.removeAllListeners("about.readyToShow");
        ipc.removeAllListeners("about.close");
    });
    return aboutPanel;
}