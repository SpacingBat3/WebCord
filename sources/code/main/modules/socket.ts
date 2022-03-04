import { Server, WebSocket } from "ws";
import { initWindow } from "./parent";
import colors from "@spacingbat3/kolor";
import { isJsonSyntaxCorrect } from "../../global/global";

function wsLog(message:string, ...args:unknown[]) {
    console.log(colors.bold(colors.brightMagenta("[WebSocket]"))+" "+message,...args);
}

function range(start:number,end:number) {
    return Array.from({length:end-start+1}, (_v,k) => start+k);
}

interface InviteResponse {
    /** Response type/command. */
    cmd: "INVITE_BROWSER",
    /** Response arguments. */
    args:{
        /** An invitation code. */
        code: string
    },
    /** Nonce indentifying the communication. */
    nonce: string;
}

function isInviteResponse(data:unknown): data is InviteResponse {
    if(!(data instanceof Object))
        return false;
    if(typeof (data as InviteResponse).cmd !== 'string')
        return false;
    if(typeof (data as InviteResponse).args.code !== 'string')
        return false;
    if(typeof (data as InviteResponse).cmd !== 'string')
        return false;
    return true;
}

const messages = {
    handShake: {
        cmd:"DISPATCH",
        data:{
            v: 1,
            config:{
                cdn_host: "cdn.discordapp.com",
                api_endpoint: "//discord.com/api",
                environment: "production"
            }
        },
        evt: "READY",
        nonce: null
    }
}

async function getServer(port:number) {
    const {WebSocketServer} = await import("ws");
    return new Promise<Server<WebSocket>|null>((resolve) => {
        const wss = new WebSocketServer({ host: '127.0.0.1', port });
        wss.once('listening', () => resolve(wss));
        wss.once('error', () => resolve(null));
    }) 
}

export default async function startServer(window:Electron.BrowserWindow) {
    let wss = null, wsPort = 6463;
    for(const port of range(6463, 6472)) {
        wss = await getServer(port);
        if(wss !== null) {
            wsLog("Listening at port: "+colors.underscore(port.toString()))
            wsPort = port;
            break;
        }
    }
    if(wss === null) return;
    wss.on('connection', (wss) => {
        wss.send(JSON.stringify(messages.handShake));
        wss.on('message', (data, isBinary) => {
            let parsedData:unknown = data;
            if(!isBinary)
                parsedData = data.toString();
            if(isJsonSyntaxCorrect(parsedData as string))
                parsedData = JSON.parse(parsedData as string);
            if(isInviteResponse(parsedData)) {
                /* Replies to browser, so it finds communication successful. */
                wss.send(JSON.stringify({
                    cmd: parsedData.cmd,
                    data: {
                        invite: null,
                        code: parsedData.args.code
                    },
                    evt: null,
                    nonce: parsedData.nonce
                }));
                wsLog("Invite code: "+parsedData.args.code);
                const child = initWindow("invite", window);
                if(child === undefined) return;
                void child.loadURL('https://discord.com/invite/'+parsedData.args.code);
                child.webContents.once("did-finish-load", () => {
                    child.show();
                });
                child.webContents.once("will-navigate", () => {
                    child.close();
                })
                /* Blocks requests to WebCord's WS, to prevent loops. */
                child.webContents.session.webRequest.onBeforeRequest({
                    urls: ['ws://127.0.0.1:'+wsPort.toString()+'/*']
                }, (_details,callback) => callback({cancel: true}));
            }
        })
    })
}