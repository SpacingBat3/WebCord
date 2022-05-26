import { app, ipcMain as ipc, screen } from 'electron/main';
import packageJson from '../../common/modules/package';
import { getBuildInfo } from '../modules/client';
import { initWindow } from '../modules/parent';

// "About" Panel:

export default function showAboutPanel(parent:Electron.BrowserWindow): Electron.BrowserWindow|undefined {
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
        frame: false,
        modal: true
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
                buildInfo: getBuildInfo(),
                appRepo: packageJson.data.homepage
            });
    });
    aboutPanel.once("close", () => {
        ipc.removeAllListeners("showAppLicense");
        ipc.removeAllListeners("about.getDetails");
        ipc.removeAllListeners("about.readyToShow");
        ipc.removeAllListeners("about.close");
    });
    return aboutPanel;
}