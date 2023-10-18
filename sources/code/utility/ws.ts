import { WebSocket, type HookSignatures } from "@spacingbat3/disconnection";
import { knownInstancesList, type WSHookAdd, type WSHookTrigger, type WSHookReturn } from "../common/global";
import { EventEmitter } from "events";

const eventLoop = new EventEmitter();

const server = new WebSocket([
  ...knownInstancesList.map(instance => instance[1].origin)
]);

const nonceSet = new Set<symbol>();

process.parentPort.on("message", ({data}: {data:unknown}) => void (async() => {
  const port = (await server.details)?.port;
  if(typeof data === "string") {
    server.log(data,port);
    return;
  }
  const message: WSHookAdd|WSHookReturn<keyof HookSignatures> = data as WSHookAdd|WSHookReturn<keyof HookSignatures>;
  const { hook } = message;
  switch(message.evt) {
    case "hook-set":
      server.addHook(hook, (...data) => new Promise((resolve,reject) => {
        const nonceSymbol = Symbol();
        nonceSet.add(nonceSymbol);
        const nonce = [...nonceSet].indexOf(nonceSymbol);
        process.parentPort.postMessage({
          evt: "hook-trigger",
          hook,
          data,
          nonce,
          port
        } satisfies WSHookTrigger<typeof hook>);
        eventLoop.once(nonceSymbol, (value?:number|Error)=>{
          if(value instanceof Error)
            reject(value);
          else
            resolve(value);
        });
      }));
      break;
    case "hook-return": {
      const event = [...nonceSet][message.nonce];
      if(event)
        eventLoop.emit(event,message.data);
      break;
    }
  }
})());