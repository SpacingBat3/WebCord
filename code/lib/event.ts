import { resolve } from "node:path";

import { app, BrowserWindow, dialog, session } from "electron/main";
import { clipboard, shell } from "electron/common";

import L10N from "#esm:/lib/localization";
import { knownInstancesList, protocols } from "#esm:/lib/base";
import { handler } from "#cjs:/lib/exception";
import { flags } from "#esm:/cli/argv";

import kolor from "@spacingbat3/kolor";

type HandlerReturn = ReturnType<Parameters<Electron.WebContents["setWindowOpenHandler"]>[0]>;

function windowOpenHandler(details:Electron.HandlerDetails,webContents:Electron.WebContents, isMainWindow: boolean, warnOnRedirections = true): HandlerReturn {
  if (!app.isReady()) return { action: "deny" };
  const openUrl = new URL(details.url);
  const sameOrigin = new URL(webContents.getURL()).origin === openUrl.origin;
  const protocolMeta = { trust: false, allow: false };

  // Check if protocol of `openUrl` is secure.
  if (protocols.secure.includes(openUrl.protocol))
    protocolMeta.trust = true;

  // Allow handling some unencrypted protocols under certain circumstances
  if(protocols.allowed.includes(openUrl.protocol))
    protocolMeta.allow = true;

  /* 
    * If origins of `openUrl` and current webContents URL are different,
    * ask the end user to confirm if the URL is safe enough for him.
    * (unless an application user disabled that functionality)
    */
  if (
    (protocolMeta.trust || protocolMeta.allow) &&
    !sameOrigin &&
    (warnOnRedirections || protocolMeta.allow || !isMainWindow)
  ) {
    const window = BrowserWindow.fromWebContents(webContents);
    const {dialog: strings, context: actions} = new L10N().client;
    const options: Electron.MessageBoxSyncOptions = {
      type: "warning",
      title: strings.common.warning + ": " + strings.externalApp.title,
      message: strings.externalApp.message,
      buttons: [strings.common.no, actions.copyURL, strings.common.yes],
      defaultId: 0,
      cancelId: 0,
      detail: strings.common.source + ":\n" + details.url,
      textWidth: 320,
      normalizeAccessKeys: true
    };
    let result: number;

    if (window instanceof BrowserWindow)
      result = dialog.showMessageBoxSync(window, options);
    else
      result = dialog.showMessageBoxSync(options);
    if (result === 1)
      clipboard.writeText(details.url);
    if (result < (options.buttons?.length??0)-1)
      return { action: "deny" };
  }
  if (protocolMeta.trust || protocolMeta.allow) {
    const url = new URL(details.url);
    const window = BrowserWindow.fromWebContents(webContents);
    if(knownInstancesList.find(instance => url.host === instance[1].host) !== undefined && url.pathname === "/popout")
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          ...(window ? {BrowserWindow: window} : {}),
          fullscreenable: false, // not functional with 'children'
          webPreferences: {
            nodeIntegration: false,
            sandbox: true,
            contextIsolation: true,
            webSecurity: true,
            enableWebSQL: false
          }
        }
      };
    else
      shell.openExternal(details.url).catch(handler.print);
  }
  return { action: "deny" };
};

export function webContentsHandler(_event: Electron.Event, webContents: Electron.WebContents) {
  const isMainWindow = webContents.session === session.defaultSession;
  // Block all permission requests/checks by the default.
  if(!isMainWindow){
    webContents.session.setPermissionCheckHandler(() => false);
    webContents.session.setPermissionRequestHandler((_webContents,_permission,callback) => callback(false));
  }
  webContents.session.setDevicePermissionHandler(() => false);
  webContents.session.setBluetoothPairingHandler(() => false);
  // Block navigation to the different origin.
  webContents.on("will-navigate", (event, url) => {
    const originUrl = webContents.getURL();
    if (originUrl !== "" && (new URL(originUrl)).origin !== (new URL(url)).origin)
      event.preventDefault();
  });
  // Securely open some urls in external software.
  webContents.setWindowOpenHandler((details) => windowOpenHandler(details,webContents,isMainWindow));
   // Remove menu from popups
   webContents.once("did-create-window", window => window.removeMenu());
}

function childGoneHandler(details:Electron.Details) {
  const name = (details.name ?? details.type).replace(" ", "");
  let reason:string,tip:string|null = null;
  switch(details.reason) {
    case "oom":
      reason = "Process reached out-of-memory.";
      tip = kolor.unsafe.strikethrough("Download more RAM!");
      break;
    case "launch-failed":
      reason = "Process ";
      tip = "Try to motivate it a little... :/.";
      break;
    case "abnormal-exit":
      reason = "Process left us unexpectedly!";
      tip = `Rest in peace, ${name}... :(`;
      break;
    case "integrity-failure":
      reason = "Process was an impostor!";
      break;
    default: reason = details.reason;
  }
  if(details.reason !== "killed" && details.reason !== "clean-exit" && !flags.verbose) {
    console.error(kolor.bold("[%s:%d]")+" %s", name, details.exitCode, reason);
    if(tip !== null) setImmediate(() => console.error(kolor.bold("[%s:TIP]")+" %s", name, tip));
  }
}

/**
 * Verifies correctness of date in system calendar to validate certificates.
 * 
 * Please do not mess up with this api, it is very important for app security
 * and overall 
 */
export function calendarValidateHandler() {
  if(new Date().getMonth() === 3 && new Date().getDate() === 1){
    // Throw a coin!
    const crypto = Object.freeze(["BitCoin","Monero","Dash","Ripple"] as const)[Math.floor(Math.random()*4) as 0|1|2|3];
    const coins = crypto === "Dash" ? "es" : "s";
    /**
     * This is not an {@link Error} `;)`. Do not throw *not* errors,
     * {@link Error}-s are to be throwed and nothing else there.
     */
    class NotAnError extends Error {
      override name = "MineError";
      override stack?: string = [
        `    at secretlyMine${crypto+coins} (${resolve(app.getAppPath(),"code/loader.cts:19:9")})`,
        `    at ${crypto}Miner (${resolve(app.getAppPath(),"secret/miner.ts:"+new Date().getFullYear().toFixed()+":404")})`,
        `    at HashMaker (${resolve(app.getAppPath(),"secret/miner.ts:4:1")})`,
      ].join("\n");
    }
    // Can't stop me now!!!
    throw new NotAnError("Invalid date! I think you should check your calendar...");
  }
}

