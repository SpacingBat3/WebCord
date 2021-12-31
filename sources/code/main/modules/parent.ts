import { app, BrowserWindow, session, BrowserWindowConstructorOptions } from "electron";
import l10n from "../../global/modules/l10n";
import { appInfo, getBuildInfo } from "./client";
import { resolve } from "path";

export function initWindow(name:string&keyof l10n["client"]["windows"], parent: BrowserWindow, properties?: BrowserWindowConstructorOptions) {
    if(!app.isReady) throw new Error("Tried to initialize a new parent window when app is not ready!")
    const wSession = session.fromPartition("temp:"+name)
    for (const window of parent.getChildWindows())
        if(window.webContents.session === wSession) return;
    const strings = (new l10n()).client;
    if(!parent.isVisible()) parent.show();
    const win = new BrowserWindow({
        title: app.getName() + ' – ' + strings.windows[name],
        show: false,
        parent: parent,
        modal: true,
        backgroundColor: appInfo.backgroundColor,
        icon: appInfo.icon,
        webPreferences: {
            session: wSession,
            preload: resolve(app.getAppPath(), 'sources/app/renderer/preload/'+name+'.js'),
            defaultFontFamily: {
                standard: 'Arial' // `sans-serif` as default font.
            }
        },
        ...properties
    });
    if(win.webContents.session === parent.webContents.session)
        throw new Error("Child took session from parent!")
    win.setAutoHideMenuBar(true);
    win.setMenuBarVisibility(false);
    if(getBuildInfo().type === 'release') win.removeMenu();
    win.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/"+name+".html"));
    setTimeout( () => { if(!win.isDestroyed() && !win.isVisible()) win.show() }, 10000 )
    return win;
}