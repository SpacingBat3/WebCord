async function handleEvents(docsWindow: Electron.BrowserWindow) {
    const [
        { existsSync },  // from "fs"
        { resolve },     // from "path"
        { app, ipcMain } // from "electron"
    ] = await Promise.all([
        import("fs"),
        import("path"),
        import("electron")
    ]);
    // Guess correct Readme.md file
    let readmeFile = 'docs/Readme.md';
    if(existsSync(resolve(app.getAppPath(), 'docs', app.getLocale(), 'Readme.md')))
        readmeFile = 'docs/'+app.getLocale()+'/Readme.md'
    ipcMain.once('documentation-load', (event) => {
        ipcMain.once('documentation-load', () => {
            if(!docsWindow.isDestroyed()) {
                docsWindow.show();
            }
        })
        event.reply('documentation-load', resolve(app.getAppPath(), readmeFile));
    })
}

export default async function loadDocsWindow(parent: Electron.BrowserWindow) {
    const [
        { initWindow },  // from "../modules/parent"
        { appInfo },     // from "../modules/client"
    ] = await Promise.all([
        import("../modules/parent"),
        import("../modules/client")
    ]);
    const docsWindow = initWindow("docs", parent, {
        minWidth: appInfo.minWinWidth,
		minHeight: appInfo.minWinHeight,
        width: 800,
        height: 720
    });
    if(docsWindow === undefined) return;
    handleEvents(docsWindow);
    docsWindow.webContents.on('did-start-loading', () => handleEvents(docsWindow));
}