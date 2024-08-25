import { commonCatches } from "../modules/error";

async function handleEvents(docsWindow: Electron.BrowserWindow) {
  const [
    existsSync,  // from "fs"
    resolve,     // from "path"
    e
  ] = [
    import("fs").then(mod => mod.existsSync),
    import("path").then(mod => (...args:string[])=> mod.resolve(...args)),
    import("electron/main")
  ];
  // Guess correct Readme.md file
  let readmeFile = "docs/Readme.md";
  if((await existsSync)((await resolve)((await e).app.getAppPath(), "docs", (await e).app.getLocale(), "Readme.md")))
    readmeFile = "docs/"+(await e).app.getLocale()+"/Readme.md";
  (await e).ipcMain.removeHandler("documentation-load");
  (await e).ipcMain.removeAllListeners("documentation-show");
  (await e).ipcMain.handle("documentation-load", async (event) => {
    if(event.senderFrame.url !== docsWindow.webContents.getURL()) return;
    (await e).ipcMain.once("documentation-show", (event) => {
      if(!docsWindow.isDestroyed() && event.senderFrame.url === docsWindow.webContents.getURL()) {
        docsWindow.show();
      }
    });
    return (await resolve)((await e).app.getAppPath(), readmeFile);
  });
}

export default async function loadDocsWindow(parent: Electron.BrowserWindow) {
  const [
    { initWindow },  // from "../modules/parent"
    { appInfo },     // from "../modules/client"
  ] = await Promise.all([
    import("../modules/parent.js"),
    import("../../common/modules/client.js")
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