import { BrowserWindow, session } from "electron/main";
import { WebSocket, HookFn, WebSocketClose } from "@spacingbat3/disconnection";
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
  const getMainWindow = () => {
    const window = BrowserWindow
      .getAllWindows()
      .find(window => window.webContents.session === session.defaultSession && window.getParentWindow() === null);
    if(window === undefined){
      console.debug("[WSS] Closed connection due to lack of main window.");
      throw new Error("Server couldn't connect to main window, try again later.");
    }
    return window;
  };
  const [
    {knownInstancesList},
    {initWindow},
    kolor,
    l10n
  ] = await Promise.all([
    import("../../common/global"),
    import("./parent"),
    import("@spacingbat3/kolor").then(kolor => kolor.default),
    import("../../common/modules/l10n").then(l10n => new l10n.default())
  ]);
  let lock = false;
  const server = new WebSocket([
    ...knownInstancesList.map(instance => instance[1].origin)
  ]);
  void server.details?.then(details => server.log(l10n.client.log.listenPort.replace("%s",kolor.underline(kolor.blueBright("%s"))), details.port));
  const hookDialog: HookFn<"GUILD_TEMPLATE_BROWSER"|"INVITE_BROWSER"> = async(parsedData, origin) => {
    const parent = getMainWindow();
    if(lock) {
      console.debug('[WSS] Blocked request "'+parsedData.cmd+'" (WSS locked).');
      return WebSocketClose.TryAgainLater;
    }
    lock = true;
    const { port } = server.details === undefined ? { port: undefined } : (await server.details);
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
  server.addHook("INVITE_BROWSER", hookDialog);
  server.addHook("GUILD_TEMPLATE_BROWSER", hookDialog);
  server.addHook("DEEP_LINK_CHANNEL", (parsedData) => {
    try {
      const parent = getMainWindow();
      const path = parsedData.args.params.channelId !== undefined ?
        "/channels/"+parsedData.args.params.guildId+"/"+parsedData.args.params.channelId :
        "/channels/"+parsedData.args.params.guildId;
      parent.webContents.send("navigate", path);
      parent.show();
      return Promise.resolve(undefined);
    } catch {
      return Promise.reject(WebSocketClose.TryAgainLater);
    }
  });
}