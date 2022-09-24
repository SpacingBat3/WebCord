import { commonCatches } from "../modules/error";

async function handleEvents(docsWindow: Electron.BrowserWindow) {
  const [
    { existsSync },  // from "fs"
    { resolve },     // from "path"
    { app, ipcMain } // from "electron/main"
  ] = await Promise.all([
    import("fs"),
    import("path"),
    import("electron/main")
  ]);
  // Guess correct Readme.md file
  let readmeFile = "docs/Readme.md";
  if(existsSync(resolve(app.getAppPath(), "docs", app.getLocale(), "Readme.md")))
    readmeFile = "docs/"+app.getLocale()+"/Readme.md";
  ipcMain.removeHandler("documentation-load");
  ipcMain.removeAllListeners("documentation-show");
  ipcMain.handle("documentation-load", (event) => {
    if(event.senderFrame.url !== docsWindow.webContents.getURL()) return;
    ipcMain.once("documentation-show", (event) => {
      if(!docsWindow.isDestroyed() && event.senderFrame.url === docsWindow.webContents.getURL()) {
        docsWindow.show();
      }
    });
    return resolve(app.getAppPath(), readmeFile);
  });
}

export default async function loadDocsWindow(parent: Electron.BrowserWindow) {
  const [
    { initWindow },  // from "../modules/parent"
    { appInfo },     // from "../modules/client"
  ] = await Promise.all([
    import("../modules/parent"),
    import("../../common/modules/client")
  ]);
  const docsWindow = initWindow("docs", parent, {
    minWidth: appInfo.minWinWidth,
    minHeight: appInfo.minWinHeight,
    width: 720,
    height: 600
  });
  if(docsWindow === undefined) return;
  handleEvents(docsWindow).catch(commonCatches.throw);
}