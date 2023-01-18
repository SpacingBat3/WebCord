import { app, BrowserWindow, session } from "electron/main";
import { resolve } from "node:path";

import L10N from "#esm:/lib/localization";
import appInfo from "#esm:/lib/meta/client";
import getBuildInfo from "#esm:/lib/meta/build";
import { load as loadThemes } from "#esm:/lib/window/plugin/theme";
import { handler } from "#cjs:/lib/exception";

import { deepmerge } from "deepmerge-ts";

/** A list of popup windows (i.e. non-local ones). */
const popups = [
  "invite"
];

/**
 * Initializes the new `BrowserWindow` that will be a child of `mainWindow`.
 * It will either create a such window or do nothing if it does already exists.
 * 
 */
export function initWindow(name:string&keyof L10N["client"]["windows"], parent: Electron.BrowserWindow, properties?: Electron.BrowserWindowConstructorOptions) {
  const isPopup = popups.includes(name);
  if(!app.isReady()) throw new Error("Tried to initialize a new parent window when app is not ready!");
  const wSession = isPopup ? session.defaultSession : session.fromPartition("temp:"+name);
  for (const window of parent.getChildWindows())
    if(window.webContents.session === wSession) return;
  if(!parent.isVisible()) parent.show();
  const window = new BrowserWindow(deepmerge<[Electron.BrowserWindowConstructorOptions,Electron.BrowserWindowConstructorOptions]>({
    title: app.getName() + " – " + (new L10N()).client.windows[name],
    show: false,
    parent: parent,
    backgroundColor: appInfo.backgroundColor,
    webPreferences: {
      ...appInfo.commonPrefs,
      session: wSession,
      autoplayPolicy: "user-gesture-required",
      disableDialogs: true,
      ...( !isPopup ? {
        preload: resolve(app.getAppPath(), "app/code/renderer/preload/"+name+".js")
      } : {}),
    },
    ...(process.platform !== "win32" ? {icon: appInfo.icons.app} : {}),
  }, properties??{}));
  if(window.webContents.session === parent.webContents.session && !isPopup)
    throw new Error("Child took session from parent!");
  // Style "popup" windows
  if(isPopup)
    window.webContents.on("did-navigate", () => {
      loadThemes(window.webContents)
        .catch(handler.throw);
    });
  // Cleanup listeners
  window.once("closed", () => window.removeAllListeners());
  window.setAutoHideMenuBar(true);
  window.setMenuBarVisibility(false);
  if(getBuildInfo().type === "release") window.removeMenu();
  if(!isPopup) void window.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/"+name+".html"));
  // Shows window when it is loading for too long.
  setTimeout( () => { if(!window.isDestroyed() && !window.isVisible()) window.show(); }, 10000 );
  return window;
}