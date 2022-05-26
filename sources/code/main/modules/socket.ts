import type { Server, WebSocket } from "ws";
import kolor from "@spacingbat3/kolor";

function wsLog(message:string, ...args:unknown[]) {
    console.log(kolor.bold(kolor.brightMagenta("[WebSocket]"))+" "+message,...args);
}

/** Generates an inclusive range (as `Array`) from `start` to `end`. */
function range(start:number,end:number) {
    return Array.from({length:end-start+1}, (_v,k) => start+k);
}

interface Response {
    /** Response type/command. */
    cmd: string,
    /** Response arguments. */
    args: Record<string,unknown>,
    /** Nonce indentifying the communication. */
    nonce: string;
}

interface InviteResponse extends Response {
    /** A request to show the invite request within the Discord client. */
    cmd: "INVITE_BROWSER",
    args:{
        /** An invitation code. */
        code: string
    }
}

interface AuthorizationResponse extends Response {
    /** A request to return the authorization details to the WS client. */
    cmd:"AUTHORIZE",
    args:{
        scopes: string[],
        /** An application's client_id. */
        client_id: string
    },
    nonce: string;
}

function isResponse(data:unknown): data is Response {
    if(!(data instanceof Object))
        return false;
    if(typeof(data as Partial<Response>)?.cmd !== 'string')
        return false;
    if(typeof(data as Partial<Response>)?.args !== 'object')
        return false;
    if(typeof (data as Partial<Response>)?.nonce !== 'string')
        return false;
    return true;
}

function isInviteResponse(data:unknown): data is InviteResponse {
    if(!isResponse(data))
        return false;
    if(data.cmd !== "INVITE_BROWSER")
        return false;
    if(!('code' in data.args) || typeof data.args['code'] !== 'string')
        return false;
    return true;
}

function isAuthorizationResponse(data:unknown): data is AuthorizationResponse {
    if(!isResponse(data))
        return false;
    if(data.cmd !== "AUTHORIZE")
        return false;
    if(!('scopes' in data.args) || !Array.isArray(data.args['scopes']))
        return false;
    for(const scope of data.args['scopes'])
        if(typeof scope !== "string")
            return false;
    if(!('client_id' in data.args) || typeof data.args['client_id'] !== 'string')
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
    }
}

/** 
 * Tries to reserve the server at given port.
 * 
 * @returns `Promise`, which always resolves (either to `Server<WebSocket>` on
 *          success or `null` on failure).
 */
async function getServer(port:number) {
    const {WebSocketServer} = await import("ws");
    return new Promise<Server<WebSocket>|null>(resolve => {
        const wss = new WebSocketServer({ host: '127.0.0.1', port });
        wss.once('listening', () => resolve(wss));
        wss.once('error', () => resolve(null));
    }) 
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
    let wss = null, wsPort = 6463;
    for(const port of range(6463, 6472)) {
        wss = await getServer(port);
        if(wss !== null) {
            void wsLog(listenPort,underscore(port.toString()));
            wsPort = port;
            break;
        }
    }
    if(wss === null) return;
    let lock = false;
    wss.on('connection', (wss, request) => {
        const origin = request.headers.origin??'https://discord.com';
        let known = false;
        for(const instance of knownIstancesList) {
            if(instance[1].origin === origin)
                known = true;
        }
        if(!known) return;
        wss.send(JSON.stringify(messages.handShake));
        wss.once('message', (data, isBinary) => {
            let parsedData:unknown = data;
            if(!isBinary)
                parsedData = data.toString();
            if(isJsonSyntaxCorrect(parsedData as string))
                parsedData = JSON.parse(parsedData as string);
            // Invite response handling
            if(isInviteResponse(parsedData)) {
                if(lock) return; lock = true;
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
                const child = initWindow("invite", window);
                if(child === undefined) return;
                void child.loadURL(origin+'/invite/'+parsedData.args.code);
                child.webContents.once("did-finish-load", () => {
                    child.show();
                });
                child.webContents.once("will-navigate", () => {
                    lock = false;
                    child.close();
                })
                // Blocks requests to WebCord's WS, to prevent loops.
                child.webContents.session.webRequest.onBeforeRequest({
                    urls: ['ws://127.0.0.1:'+wsPort.toString()+'/*']
                }, (_details,callback) => callback({cancel: true}));
            }
            // RPC response handling
            else if(isAuthorizationResponse(parsedData))
                void wsLog("Received RPC authorization request, but "+kolor.bold("RPC is not implemented yet")+".");
            // Unknown response error
            else if(isResponse(parsedData))
                console.error("[WS] Request of type: '"+parsedData.cmd+"' is currently not supported.");
            // Unknown text message error
            else if(!isBinary)
                console.error("[WS] Could not handle the packed text data: '"+data.toString()+"'.");
            // Unknown binary data transfer error
            else
                console.error("[WS] Unknown data transfer (not text).");
        })
    })
}