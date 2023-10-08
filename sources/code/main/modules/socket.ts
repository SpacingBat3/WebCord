import { resolve } from "path";
import { BrowserWindow, session, utilityProcess, app, type UtilityProcess } from "electron/main";

import { WebSocketClose, type HookFn, type HookSignatures } from "@spacingbat3/disconnection";
import kolor from "@spacingbat3/kolor";

import L10N from "../../common/modules/l10n";
import type { WSHookAdd, WSHookReturn, WSHookTrigger } from "../../common/global";
import { initWindow } from "./parent";

type LocalHookFn<T extends keyof HookSignatures> = (...args:[...HookSignatures[T],(number|undefined)?]) => Awaited<ReturnType<HookFn<T>>>;

let server: UtilityProcess;

function getMainWindow() {
  const window = BrowserWindow
    .getAllWindows()
    .find(window => window.webContents.session === session.defaultSession && window.getParentWindow() === null);
  if(window === undefined){
    console.debug("[WSS] Closed connection due to lack of main window.");
    throw new Error("Server couldn't connect to main window, try again later.");
  }
  return window;
}

export default function startServer() {
  const l10n = new L10N();
  let lock = false;
  const isColorEnabled = kolor.cyan("")!=="";
  server = utilityProcess.fork(resolve(app.getAppPath(),"app/code/utility/ws.js"), [
    isColorEnabled ? "--color=always" : "--color=never"
  ], {
    stdio: "pipe"
  });
  server.stdout?.pipe(process.stdout);
  server.stderr?.pipe(process.stderr);
  server.once("spawn", () => {
    server.postMessage(
      l10n.client.log.listenPort.replace(
        "%s",
        kolor.underline(kolor.blueBright("%s"))
      )
    );
    const hookDialog: LocalHookFn<"INVITE_BROWSER"|"GUILD_TEMPLATE_BROWSER"> = (...args) => {
      const [parsedData,origin,port] = args;
      const parent = getMainWindow();
      if(lock) {
        console.debug('[WSS] Blocked request "'+parsedData.cmd+'" (WSS locked).');
        return WebSocketClose.TryAgainLater;
      }
      lock = true;
      if(port === undefined)
        return;
      const winProperties = parsedData.cmd === "GUILD_TEMPLATE_BROWSER" ?
        {width: 960} : {};
      const child = initWindow("invite", parent, {...winProperties,...{
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          disableDialogs: true
        }
      }});
      if(child === undefined) return;
      const path = parsedData.cmd === "INVITE_BROWSER" ?
        "/invite/" : "/template/";
      const parentOrigin = new URL(parent.webContents.getURL()).origin;
      const type = /^https?:\/\/(?:[a-z]+\.)?discord\.com$/;
      const childOrigin = origin === null || (
        type.test(origin) && type.test(parentOrigin)
      ) ? parentOrigin : origin;
      void child.loadURL(childOrigin+path+parsedData.args.code);
      child.webContents.once("did-finish-load", () => {
        child.show();
      });
      child.webContents.once("will-navigate", () => child.close());
      child.once("closed", () => lock = false);
      // Blocks requests to WebCord's WS, to prevent loops.
      child.webContents.session.webRequest.onBeforeRequest({
        urls: ["ws://127.0.0.1:"+port.toString()+"/*"]
      }, (_details,callback) => callback({cancel: true}));
      return;
    };
    const hooks = Object.freeze([
      "INVITE_BROWSER","GUILD_TEMPLATE_BROWSER","DEEP_LINK_CHANNEL"
    ] as const satisfies readonly (keyof HookSignatures)[]);

    hooks.forEach(hook => server.postMessage({evt: "hook-set", hook } satisfies WSHookAdd));
    server.on("message", (message:string|WSHookTrigger<(typeof hooks)[0|1|2]>) => {
      if(typeof message === "string") {
        console.log(message);
        return;
      }
      type bData = [
        typeof message.data[0]&{cmd:"INVITE_BROWSER"},
        typeof message.data[1]
      ]|[
        typeof message.data[0]&{cmd:"GUILD_TEMPLATE_BROWSER"},
        typeof message.data[1]
      ];
      if(message.evt as unknown !== "hook-trigger")
        return;
      const { hook, nonce } = message;
      let data;
      const parsedData = message.data[0] as (typeof message.data[0]&{cmd:"DEEP_LINK"});
      switch(hook) {
        case "INVITE_BROWSER":
        case "GUILD_TEMPLATE_BROWSER":
          data=undefined;
          try {
            data=hookDialog(...(message.data as bData), message.port);
          } catch(error) {
            if(error instanceof Error)
              data=error;
          }
          server.postMessage({
            evt: "hook-return",
            hook,
            data,
            nonce
          } satisfies WSHookReturn<"INVITE_BROWSER"|"GUILD_TEMPLATE_BROWSER">);
          break;
        case "DEEP_LINK_CHANNEL":
          data=undefined;
          try {
            const parent = getMainWindow();
            const path = parsedData.args.params.channelId !== undefined ?
              "/channels/"+parsedData.args.params.guildId+"/"+parsedData.args.params.channelId :
              "/channels/"+parsedData.args.params.guildId;
            parent.webContents.send("navigate", path);
            parent.show();
          } catch {
            data=WebSocketClose.TryAgainLater;
          }
          server.postMessage({
            evt: "hook-return",
            hook,
            data,
            nonce,
          } satisfies WSHookReturn<"DEEP_LINK_CHANNEL">);
          break;
        default:
          if((hooks as readonly string[]).includes(hook))
            throw new Error(`Unhandled hook: "${String(hook)}"`);
      }
    });
  });
}