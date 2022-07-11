import { app, ipcMain as ipc, screen } from "electron/main";
import packageJson from "../../common/modules/package";
import { getBuildInfo } from "../../common/modules/client";
import { initWindow } from "../modules/parent";

// "About" Panel:

export default function showAboutPanel(parent:Electron.BrowserWindow): Electron.BrowserWindow|undefined {
  const screenBounds = screen.getPrimaryDisplay().size;
  const [width, height] = [
    (screenBounds.width < 600 ? screenBounds.width : 600),
    (screenBounds.height < 480 ? screenBounds.height : 480)
  ];
  const aboutPanel = initWindow("about", parent, {
    width,
    height,
    resizable: false,
    fullscreenable: false,
    frame: false,
    modal: true
  });
  const appDetails = {
    appName: app.getName(),
    appVersion: app.getVersion(),
    buildInfo: getBuildInfo(),
    appRepo: packageJson.data.homepage
  };
  if(aboutPanel === undefined) return;
  ipc.once("about.close", () => {
    if(!aboutPanel.isDestroyed()) aboutPanel.close();
  });
  ipc.once("about.readyToShow", () => {
    if(!aboutPanel.isDestroyed())
      aboutPanel.show();
  });
  ipc.handle("about.getDetails", () => appDetails);
  aboutPanel.once("close", () => {
    ipc.removeAllListeners("showAppLicense");
    ipc.removeAllListeners("about.readyToShow");
    ipc.removeAllListeners("about.close");
    ipc.removeHandler("about.getDetails");
  });
  return aboutPanel;
}