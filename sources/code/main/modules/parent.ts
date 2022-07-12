import { app, BrowserWindow, session } from "electron/main";
import l10n from "../../common/modules/l10n";
import { appInfo, getBuildInfo } from "../../common/modules/client";
import { resolve } from "path";

/** A list of popup windows (i.e. non-local ones). */
const popups = [
  "invite"
];

/**
 * Initializes the new `BrowserWindow` that will be a child of `mainWindow`.
 * It will either create a such window or do nothing if it does already exists.
 * 
 */
export function initWindow(name:string&keyof l10n["client"]["windows"], parent: Electron.BrowserWindow, properties?: Electron.BrowserWindowConstructorOptions) {
  const isPopup = popups.includes(name);
  if(!app.isReady) throw new Error("Tried to initialize a new parent window when app is not ready!");
  const wSession = isPopup ? session.defaultSession : session.fromPartition("temp:"+name);
  for (const window of parent.getChildWindows())
    if(window.webContents.session === wSession) return;
  if(!parent.isVisible()) parent.show();
  const win = new BrowserWindow({
    title: app.getName() + " – " + (new l10n()).client.windows[name],
    show: false,
    parent: parent,
    backgroundColor: appInfo.backgroundColor,
    icon: appInfo.icon,
    webPreferences: {
      session: wSession,
      defaultFontFamily: {
        standard: "Arial" // `sans-serif` as default font.
      },
      ...( !isPopup ? {
        preload: resolve(app.getAppPath(), "app/code/renderer/preload/"+name+".js")
      } : {}),
    },
    ...properties
  });
  if(win.webContents.session === parent.webContents.session && !isPopup)
    throw new Error("Child took session from parent!");
  win.setAutoHideMenuBar(true);
  win.setMenuBarVisibility(false);
  if(getBuildInfo().type === "release") win.removeMenu();
  if(!isPopup) void win.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/"+name+".html"));
  // Shows window when it is loading for too long.
  setTimeout( () => { if(!win.isDestroyed() && !win.isVisible()) win.show(); }, 10000 );
  return win;
}