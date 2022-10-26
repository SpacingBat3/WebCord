import type { Server } from "ws";
import kolor from "@spacingbat3/kolor";
import { BrowserWindow, session } from "electron/main";

function wsLog(message:string, ...args:unknown[]) {
  console.log(kolor.bold(kolor.magentaBright("[WebSocket]"))+" "+message,...args);
}

interface Response<C extends string, T extends string|never> {
  /** Response type/command. */
  cmd: C;
  /** Response arguments. */
  args: ResponseArgs<C, T>;
  /** Nonce indentifying the communication. */
  nonce: string;
}

type ResponseArgs<C extends string, T extends string|never> =
C extends "INVITE_BROWSER"|"GUILD_TEMPLATE_BROWSER" ? {
  /** An invitation code. */
  code: string;
} : C extends "AUTHORIZE" ? {
  scopes: string[];
  /** An application's client_id. */
  client_id: string;
} : C extends "DEEP_LINK" ? T extends string ? {
  type: T;
  params: ResponseParams<T>;
} : {
  type: string;
  params: Record<string,unknown>;
} : Record<string,unknown>;

type ResponseParams<T extends string> = T extends "CHANNEL" ? {
  guildId: string;
  channelId?: string;
  search: string;
  fingerprint: string;
} : Record<string,unknown>;

type typeofResult = "string" | "number" | "bigint" | "boolean" | "object" |
"function" | "undefined";
type typeofResolved<T extends typeofResult> =  T extends "string" ? string :
  T extends "number" ? number : T extends "bigint" ? bigint :
    T extends "boolean" ? boolean : T extends "object" ? object|null :
      T extends "function" ? (...args:unknown[])=>unknown :
        T extends "undefined" ? undefined : unknown;
/**
 * Generic response checker, assumes Discord will do requests of certain type
 * based on `cmd` and `argsType` values.
 */
function isResponse<C,T>(data:unknown, cmd?: C&string|(C&string)[], argsType?: T&string): data is Response<C extends string ? C : string,T extends string ? T : never> {
  function checkRecord<T extends (string|number|symbol)[], X extends typeofResult>(record:Record<string|number|symbol, unknown>,keys:T,arg:X): record is Record<T[number],typeofResolved<X>> {
    for(const key of keys)
      if(typeof record[key] !== arg)
        return false;
    return true;
  }
  if(typeof (data as Response<string,never>).cmd !== "string")
    return false;
  if(!(data instanceof Object))
    return false;
  if(typeof cmd === "string") {
    if((data as Response<string,never>).cmd !== cmd)
      return false;
  } else if(Array.isArray(cmd)) {
    if(!cmd.includes((data as Response<string,never>).cmd as C&string))
      return false;
  }
  if(typeof(data as Response<string,never>).args !== "object")
    return false;
  if(argsType !== undefined && typeof (data as Response<"DEEP_LINK",typeof argsType>).args.params === "object")
    switch(argsType) {
      case "CHANNEL":
        if(!checkRecord(
          (data as Response<"DEEP_LINK","CHANNEL">).args.params,
          ["guildId", "channelId", "search", "fingerprint"], "string"
        ) && (data as Response<"DEEP_LINK","CHANNEL">).args.params.channelId !== undefined)
          return false;
    }
  if(typeof (data as Response<string,never>).nonce !== "string")
    return false;
  return true;
}
const messages = {
  /**
     * A fake, hard-coded Discord command to spoof the presence of
     * official Discord client (which makes browser to actually start a
     * communication with the WebCord).
     */
  handShake: Object.freeze({
    /** Message command. */
    cmd:"DISPATCH",
    /** Message data. */
    data:{
      /** Message scheme version. */
      v: 1,
      /** Client properties. */
      config: {
        /** Discord CDN host (hard-coded for `discord.com` instance). */
        cdn_host: "cdn.discordapp.com",
        /** API endpoint (hard-coded for `discord.com` instance). */
        api_endpoint: "//discord.com/api",
        /** Client type. Can be (probably) `production` or `canary`. */
        environment: "production"
      }
    },
    evt: "READY",
    nonce: null
  })
};
/** 
 * Tries to reserve the server using given (inclusive) port range.
 * @param start A minimum port that should be assigned to the server.
 * @param end A maximum port that should be assigned to the server.
 * 
 * @returns `Promise`, which always resolves (either to `Server<WebSocket>` on
 *          success or `null` on failure).
 */
async function getServer(start:number,end:number) {
  const {WebSocketServer} = await import("ws");
  function tryServer(port: number) {
    return new Promise<readonly [Server, number] | null>(resolve => {
      if(port > end) resolve(null);
      const wss = new WebSocketServer({ host: "127.0.0.1", port: port++ });
      wss.once("listening", () => {
        resolve(Object.freeze([wss,port-1] as const));
        wss.removeAllListeners("error");
      });
      wss.once("error", () => {
        resolve(tryServer(port));
        wss.close();
      });
    });
  }
  return tryServer(start);
}

/**
 * Tries to start a WebSocket server at given port range. If this process
 * has succeed, it will start listening to the browser requests which are meant
 * to be sent to official Discord client.
 * 
 * Currently it supports only the invitation link requests.
 * 
 * @param window Parent window for invitation popup.
 */
export default async function startServer() {
  const getMainWindow = () => BrowserWindow
    .getAllWindows()
    .find(window => window.webContents.session === session.defaultSession && window.getParentWindow() === null);
  const [
    {isJsonSyntaxCorrect, knownInstancesList: knownIstancesList},
    {initWindow},
    {underline, blue},
    L10N
  ] = await Promise.all([
    import("../../common/global"),
    import("./parent"),
    import("@spacingbat3/kolor").then(kolor => kolor.default),
    import("../../common/modules/l10n").then(l10n => l10n.default)
  ]);
  const [wsServer,wsPort] = await getServer(6463, 6472)??[null,6463] as const;
  if(wsServer === null) return;
  
  wsLog(new L10N().client.log.listenPort,blue(underline(wsPort.toString())));
  let lock = false;
  wsServer.on("connection", (wss, request) => {
    const origin = request.headers.origin??"https://discord.com";
    const trust = {
      isKnown: knownIstancesList.filter(instance => instance[1].origin === origin).length !== 0,
      isDiscordService: /^https:\/\/[a-z]+\.discord\.com$/.test(origin),
      isLocal: origin === "http://127.0.0.1"
    };
    // Checks if origin is associated in Discord or localy installed software.
    if(!trust.isKnown && !trust.isDiscordService && !trust.isLocal) {
      console.debug("[WSS] Blocked request from origin '"+origin+"'. (not trusted)");
      wss.close(1008,"Client is not trusted.");
      return;
    }
    // Checks if origin is associated with the current WebCord's instance.
    if(trust.isDiscordService || trust.isLocal) {
      console.debug("[WSS] Blocked request from origin '"+origin+"'. (not supported)");
      wss.close(1008,"Client is not supported.");
      return;
    }
    // Send handshake
    wss.send(JSON.stringify(messages.handShake));
    wss.once("message", (data, isBinary) => {
      let parsedData:unknown = data;
      if(!isBinary)
        parsedData = (data as Buffer).toString();
      if(isJsonSyntaxCorrect(parsedData as string))
        parsedData = JSON.parse(parsedData as string);
      const parent = getMainWindow();
      if(parent === undefined){
        console.debug("[WSS] Closed connection due to lack of main window.");
        wss.close(1013,"Server couldn't connect to main window, try again later.");
        return;
      }
      // Invitation response handling
      if(isResponse(parsedData, ["INVITE_BROWSER", "GUILD_TEMPLATE_BROWSER"] as ("INVITE_BROWSER"|"GUILD_TEMPLATE_BROWSER")[])) {
        if(lock) {
          console.debug('[WSS] Blocked request "'+parsedData.cmd+'" (WSS locked).');
          wss.close(1013,"Server is busy, try again later.");
          return;
        }
        lock = true;
        // Replies to the browser, so it finds the communication successful.
        wss.send(JSON.stringify({
          cmd: parsedData.cmd,
          data: {
            invite: null,
            code: parsedData.args.code
          },
          evt: null,
          nonce: parsedData.nonce
        }));
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
        const childOrigin = type.test(origin) && type.test(parentOrigin) ?
          parentOrigin : origin;
        void child.loadURL(childOrigin+path+parsedData.args.code);
        child.webContents.once("did-finish-load", () => {
          child.show();
        });
        child.webContents.once("will-navigate", () => child.close());
        child.once("closed", () => lock = false);
        // Blocks requests to WebCord's WS, to prevent loops.
        child.webContents.session.webRequest.onBeforeRequest({
          urls: ["ws://127.0.0.1:"+wsPort.toString()+"/*"]
        }, (_details,callback) => callback({cancel: true}));
        // Path redirection requests
      } else if(isResponse(parsedData, "DEEP_LINK", "CHANNEL")) {
        const path = parsedData.args.params.channelId !== undefined ?
          "/channels/"+parsedData.args.params.guildId+"/"+parsedData.args.params.channelId :
          "/channels/"+parsedData.args.params.guildId;
        parent.webContents.send("navigate", path);
        parent.show();
        wss.send(JSON.stringify({
          cmd: parsedData.cmd,
          data: null,
          evt: null,
          nonce: parsedData.nonce
        }));
      }
      // RPC response handling
      else if(isResponse(parsedData, "AUTHORIZE")) {
        wsLog("Received RPC authorization request, but "+kolor.bold("RPC is not implemented yet")+".");
        wss.close(1007, "Request of type: 'AUTHORIZE' is currently not supported.");
      }
      // Unknown response error
      else if(isResponse(parsedData)) {
        const type = typeof parsedData.args["type"] === "string" ?
          parsedData.cmd+":"+parsedData.args["type"] : parsedData.cmd;
        const msg = "Request of type: '"+type+"' is currently not supported.";
        console.error("[WS] "+msg);
        console.debug("[WS] Request %s", JSON.stringify(parsedData,undefined,4));
        wss.close(1007, msg);
      }
      // Unknown text message error
      else if(!isBinary) {
        const msg = "Could not handle the packed text data: '"+(data as Buffer).toString()+"'.";
        console.error("[WS] "+msg);
        wss.close(1007, msg);
      }
      // Unknown binary data transfer error
      else {
        console.error("[WS] Unknown data transfer (not text).");
        wss.close(1003, "Unknown data transfer");
      }
    });
  });
}