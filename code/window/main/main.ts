import { app, BrowserWindow, BrowserView } from "electron/main";

import appInfo from "#esm:/lib/meta/client";
import { knownInstancesList } from "#esm:/lib/base";

function cleanupEvents(window:BrowserWindow|null,views:Record<string,BrowserView>|null) {
  if(window) {
    window.removeAllListeners();
    window.webContents.removeAllListeners();
    window.webContents.session.removeAllListeners();
    window.close();
  }
  if(views) Object.entries(views).forEach(entry => {
    entry[1].webContents.removeAllListeners();
    entry[1].webContents.session.removeAllListeners();
  });
}

function init(minimized = false) {
  const window = new BrowserWindow({
    title: app.getName(),
    minWidth: appInfo.minWinWidth,
    minHeight: appInfo.minWinHeight,
    //height: mainWindowState.initState.height,
    //width: mainWindowState.initState.width,
    backgroundColor: appInfo.backgroundColor,
    show: !minimized,
    webPreferences: appInfo.commonPrefs,
    // Windows icon scaling is horrible!
    ...(process.platform !== "win32" ? {icon: appInfo.icons.app} : {}),
  });
  const views = {
    discord: new BrowserView({ webPreferences: appInfo.commonPrefs }),
  }
  views.discord.webContents.loadURL(`${knownInstancesList[0][1].origin}/app`);
  views.discord.webContents.on("did-finish-load", () => {
    if(window.webContents.isLoading())
      window.webContents.once("did-finish-load", () => window.addBrowserView(views.discord));
    else
      window.addBrowserView(views.discord)
  });
  return window
}