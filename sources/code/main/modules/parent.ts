import { app, BrowserWindow, session } from "electron/main";
import L10N from "../../common/modules/l10n";
import { appInfo, getBuildInfo } from "../../common/modules/client";
import { resolve } from "path";
import { deepmerge } from "deepmerge-ts";
import { styles } from "./extensions";
import { commonCatches } from "./error";

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
  const win = new BrowserWindow(deepmerge<[Electron.BrowserWindowConstructorOptions,Electron.BrowserWindowConstructorOptions]>({
    title: app.getName() + " – " + (new L10N()).client.windows[name],
    show: false,
    parent: parent,
    backgroundColor: appInfo.backgroundColor,
    webPreferences: {
      session: wSession,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      enableWebSQL: false,
      webgl: false,
      autoplayPolicy: "user-gesture-required",
      defaultFontFamily: {
        standard: "Arial" // `sans-serif` as default font.
      },
      ...( !isPopup ? {
        preload: resolve(app.getAppPath(), "app/code/renderer/preload/"+name+".js")
      } : {}),
    },
    ...(process.platform !== "win32" ? {icon: appInfo.icons.app} : {}),
  }, properties??{}));
  if(win.webContents.session === parent.webContents.session && !isPopup)
    throw new Error("Child took session from parent!");
  // Style "popup" windows
  if(isPopup)
    win.webContents.on("did-navigate", () => {
      styles.load(win.webContents)
        .catch(commonCatches.throw);
    });
  // Cleanup listeners
  win.once("closed", () => win.removeAllListeners());
  win.setAutoHideMenuBar(true);
  win.setMenuBarVisibility(false);
  if(getBuildInfo().type === "release") win.removeMenu();
  if(!isPopup) void win.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/"+name+".html"));
  // Shows window when it is loading for too long.
  setTimeout( () => { if(!win.isDestroyed() && !win.isVisible()) win.show(); }, 10000 );
  return win;
}