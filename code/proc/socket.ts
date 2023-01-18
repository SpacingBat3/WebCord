import { knownInstancesList } from "#esm:/lib/base";
import { WebSocket } from "@spacingbat3/disconnection";

const server = new WebSocket([
  ...knownInstancesList.map(instance => instance[1].origin)
]);

// Pass hooks to parent process
Object.freeze([
  "INVITE_BROWSER",
  "GUILD_TEMPLATE_BROWSER",
  "AUTHORIZE",
  "DEEP_LINK_CHANNEL"
] as const).forEach(value => {
  server.addHook(value,(...args) => new Promise((resolve) => {
    process.parentPort.postMessage([...args]);
    process.parentPort.once("message",(event) => {
      const data:[string,number|undefined]|[string] = event.data;
      if(data[0] === value)
        resolve(data[1]);
    });
  }))
})