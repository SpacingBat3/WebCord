import type { Server, WebSocket } from "ws";
import kolor from "@spacingbat3/kolor";

function wsLog(message:string, ...args:unknown[]) {
  console.log(kolor.bold(kolor.brightMagenta("[WebSocket]"))+" "+message,...args);
}

/** Generates an inclusive range (as `Array`) from `start` to `end`. */
function range(start:number,end:number) {
  return Array.from({length:end-start+1}, (_v,k) => start+k);
}

interface Response<C extends string, T extends string|never> {
    /** Response type/command. */
    cmd: C,
    /** Response arguments. */
    args: ResponseArgs<C, T>,
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
  if(typeof (data as Partial<Response<string,never>>)?.cmd !== "string")
    return false;
  if(!(data instanceof Object))
    return false;
  if(typeof cmd === "string") {
    if((data as Partial<Response<string,never>>)?.cmd !== cmd)
      return false;
  } else if(Array.isArray(cmd)) {
    if(!cmd.includes((data as unknown as Response<string,never>).cmd as C&string))
      return false;
  }
  if(typeof(data as Partial<Response<string,never>>)?.args !== "object")
    return false;
  if(argsType && typeof (data as Partial<Response<"DEEP_LINK",typeof argsType>>)?.args?.params === "object")
    switch(argsType) {
      case "CHANNEL":
        if(!checkRecord(
          (data as Response<"DEEP_LINK","CHANNEL">)?.args?.params,
          ["guildId", "channelId", "search", "fingerprint"], "string"
        ) && (data as Response<"DEEP_LINK","CHANNEL">)?.args?.params?.channelId !== undefined)
          return false;
    }
  if(typeof (data as Partial<Response<string,never>>)?.nonce !== "string")
    return false;
  return true;
}
const messages = {
  /**
     * A fake, hard-coded Discord command to spoof the presence of
     * official Discord client (which makes browser to actually start a
     * communication with the WebCord).
     */
  handShake: {
    /** Message command. */
    cmd:"DISPATCH",
    /** Message data. */
    data:{
      /** Message scheme version. */
      v: 1,
      /** Client properties. */
      config:{
        /* eslint-disable camelcase */
        /** Discord CDN host (hard-coded for `discord.com` instance). */
        cdn_host: "cdn.discordapp.com",
        /** API endpoint (hard-coded for `discord.com` instance). */
        api_endpoint: "//discord.com/api",
        /** Client type. Can be (probably) `production` or `canary`. */
        environment: "production"
        /* eslint-enable camelcase */
      }
    },
    evt: "READY",
    nonce: null
  }
};
/** 
 * Tries to reserve the server at given port.
 * 
 * @returns `Promise`, which always resolves (either to `Server<WebSocket>` on
 *          success or `null` on failure).
 */
async function getServer(port:number) {
  const {WebSocketServer} = await import("ws");
  return new Promise<Server<WebSocket>|null>(resolve => {
    const wss = new WebSocketServer({ host: "127.0.0.1", port });
    wss.once("listening", () => resolve(wss));
    wss.once("error", () => resolve(null));
  });
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
export default async function startServer(window:Electron.BrowserWindow) {
  const [
    {isJsonSyntaxCorrect, knownInstancesList: knownIstancesList},
    {initWindow},
    {underscore},
    L10N
  ] = await Promise.all([
    import("../../common/global"),
    import("./parent"),
    import("@spacingbat3/kolor").then(kolor => kolor.default),
    import("../../common/modules/l10n").then(l10n => l10n.default)
  ]);
  const {listenPort} = new L10N().client.log;
  let wss: Server<WebSocket> | null = null, wsPort = 6463;
  for(const port of range(6463, 6472)) {
    // eslint-disable-next-line no-await-in-loop
    wss = await getServer(port);
    if(wss !== null) {
      wsLog(listenPort,underscore(port.toString()));
      wsPort = port;
      break;
    }
  }
  if(wss === null) return;
  let lock = false;
  wss.on("connection", (wss, request) => {
    const origin = request.headers.origin??"https://discord.com";
    let known = false;
    for(const instance of knownIstancesList) {
      if(instance[1].origin === origin)
        known = true;
    }
    if(!known) return;
    wss.send(JSON.stringify(messages.handShake));
    wss.once("message", (data, isBinary) => {
      let parsedData:unknown = data;
      if(!isBinary)
        parsedData = data.toString();
      if(isJsonSyntaxCorrect(parsedData as string))
        parsedData = JSON.parse(parsedData as string);
      // Invite response handling
      if(isResponse(parsedData, ["INVITE_BROWSER", "GUILD_TEMPLATE_BROWSER"] as ("INVITE_BROWSER"|"GUILD_TEMPLATE_BROWSER")[])) {
        if(lock) {
          console.debug('Blocked request "'+parsedData.cmd+'" (WSS locked).');
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
        const child = initWindow("invite", window, winProperties);
        if(child === undefined) return;
        const path = parsedData.cmd === "INVITE_BROWSER" ?
          "/invite/" : parsedData.cmd === "GUILD_TEMPLATE_BROWSER" ?
            "/template/" : null;
        if(path !== null)
          void child.loadURL(origin+path+parsedData.args.code);
        else
          throw new TypeError('WSS handled wrong request type: "'+parsedData.cmd+'".');
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
        window.webContents.send("navigate", path);
        window.show();
        wss.send(JSON.stringify({
          cmd: parsedData.cmd,
          data: null,
          evt: null,
          nonce: parsedData.nonce
        }));
      }
      // RPC response handling
      else if(isResponse(parsedData, "AUTHORIZATION"))
        wsLog("Received RPC authorization request, but "+kolor.bold("RPC is not implemented yet")+".");
      // Unknown response error
      else if(isResponse(parsedData)) {
        const type = typeof parsedData.args["type"] === "string" ?
          parsedData.cmd+":"+parsedData.args["type"] : parsedData.cmd;
        console.error("[WS] Request of type: '"+type+"' is currently not supported.");
        console.debug("[WS] Request %s", JSON.stringify(parsedData,undefined,4));
      }
      // Unknown text message error
      else if(!isBinary)
        console.error("[WS] Could not handle the packed text data: '"+data.toString()+"'.");
      // Unknown binary data transfer error
      else
        console.error("[WS] Unknown data transfer (not text).");
    });
  });
}