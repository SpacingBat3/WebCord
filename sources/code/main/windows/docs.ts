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
  ipcMain.removeAllListeners("documentation-load");
  ipcMain.handle("documentation-load", () => {
    ipcMain.once("documentation-show", () => {
      if(!docsWindow.isDestroyed()) {
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
    width: 800,
    height: 720
  });
  if(docsWindow === undefined) return;
  handleEvents(docsWindow).catch(commonCatches.throw);
}