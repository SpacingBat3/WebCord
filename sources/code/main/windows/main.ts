import { createHash } from "crypto";
import { EventEmitter } from "events";
import { resolve } from "path";

import kolor from "@spacingbat3/kolor";

import { appInfo, getBuildInfo } from "../../common/modules/client";
import { AppConfig, WinStateKeeper } from "../modules/config";
import { app, BrowserWindow, net, ipcMain, desktopCapturer, BrowserView } from "electron/main";
import { NativeImage, nativeImage } from "electron/common";
import * as getMenu from "../modules/menu";
import { discordFavicons, knownInstancesList } from "../../common/global";
import packageJson from "../../common/modules/package";
import { getWebCordCSP } from "../modules/csp";
import l10n from "../../common/modules/l10n";
import { loadChromiumExtensions, loadStyles } from "../modules/extensions";
import { commonCatches } from "../modules/error";

const configData = new AppConfig();

export default function createMainWindow(startHidden: boolean): BrowserWindow {
  const l10nStrings = (new l10n()).client;

  const internalWindowEvents = new EventEmitter();

  // Check the window state

  const mainWindowState = new WinStateKeeper("mainWindow");

  // Browser window

  const win = new BrowserWindow({
    title: app.getName(),
    minWidth: appInfo.minWinWidth,
    minHeight: appInfo.minWinHeight,
    height: mainWindowState.initState.height,
    width: mainWindowState.initState.width,
    backgroundColor: appInfo.backgroundColor,
    icon: appInfo.icon,
    show: false,
    webPreferences: {
      preload: resolve(app.getAppPath(), "app/code/renderer/preload/main.js"),
      nodeIntegration: false,
      devTools: true, // Too usefull to be blocked.
      defaultFontFamily: {
        standard: "Arial" // `sans-serif` as default font.
      },
      enableWebSQL: false,
      webgl: configData.get().settings.advanced.webApi.webGl,
      safeDialogs: true,
      autoplayPolicy: "no-user-gesture-required"
    }
  });
  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    if (errorCode <= -100 && errorCode >= -199)
    // Show offline page on connection errors.
      void win.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/404.html"));
    else if (errorCode === -30) {
      // Ignore CSP errors.
      console.warn(kolor.bold("[WARN]")+' A page "'+validatedURL+'" was blocked by CSP.');
      return;
    }
    console.error(kolor.bold("[ERROR]")+" "+errorDescription+" ("+(errorCode*-1).toString()+")");
    const retry = setInterval(() => {
      if (net.isOnline()) {
        clearInterval(retry);
        void win.loadURL(knownInstancesList[new AppConfig().get().settings.advanced.currentInstance.radio][1].href);
      }
    }, 1000);
  });
  win.webContents.once("did-finish-load", () => {
    console.debug("[PAGE] Starting to load the Discord page...");
    if (!startHidden) win.show();
    setTimeout(() => {void win.loadURL(knownInstancesList[new AppConfig().get().settings.advanced.currentInstance.radio][1].href);}, 1500);
  });
  if (mainWindowState.initState.isMaximized) win.maximize();

  // CSP

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headersOverwrite:{"Content-Security-Policy"?:[string]} = {};
    if (configData.get().settings.advanced.csp.enabled) {
      console.debug("[CSP] Overwritting Discord CSP.");
      headersOverwrite["Content-Security-Policy"] = [getWebCordCSP().toString()];
    }
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        ...headersOverwrite
      }
    });
  });

  win.webContents.session.webRequest.onBeforeRequest(
    {
      urls: [
        "https://*/cdn-cgi/bm/cv/*/api.js",
        "https://*/api/*/science",
        "https://*/api/*/channels/*/typing",
        "https://*/api/*/track"
      ]
    },
    (details, callback) => {

      const configData = (new AppConfig()).get().settings.privacy.blockApi;
            
      const cancel = configData.science ||
                configData.typingIndicator ||
                configData.fingerprinting;

      const url = new URL(details.url);

      if (cancel) console.debug("[API] Blocking " + url.pathname);

      if (url.pathname.endsWith("/science") || url.pathname.endsWith("/track"))
        callback({ cancel: configData.science });
      else if (url.pathname.endsWith("/typing"))
        callback({ cancel: configData.typingIndicator });
      else if (url.pathname.endsWith("/api.js"))
        callback({ cancel: configData.fingerprinting });
      else
        callback({ cancel: false });

    },
  );
  // (Device) permissions check/request handlers:
  {
    /** List of domains, urls or protocols accepted by permission handlers. */
    const trustedURLs = [
      knownInstancesList[new AppConfig().get().settings.advanced.currentInstance.radio][1].origin,
      "devtools://"
    ];
    const permissionHandler = function (webContentsUrl:string, permission:string, details:Electron.PermissionRequestHandlerHandlerDetails|Electron.PermissionCheckHandlerHandlerDetails):boolean|null {
      {
        const webContents = new URL(webContentsUrl);
        if(webContents.origin !== trustedURLs[0] && webContents.protocol !== trustedURLs[1])
          return false;
      }
      switch (permission) {
        case "media":{
          let callbackValue = true;
          if("mediaTypes" in details)
            details.mediaTypes.map(type => callbackValue = callbackValue &&
              configData.get().settings.privacy.permissions[type]
            );
          else if("mediaType" in details && details.mediaType !== "unknown")
            callbackValue = configData.get().settings.privacy.permissions[details.mediaType];
          else
            callbackValue = false;
          return callbackValue;
        }
        case "notifications":
        case "fullscreen":
          return configData.get().settings.privacy.permissions[permission];
        default:
          return null;
      }
    };
    win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
      const requestUrl = (webContents !== null && webContents.getURL() !== "" ? webContents.getURL() : requestingOrigin);
      const returnValue = permissionHandler(requestUrl,permission,details);
      if(returnValue === null) {
        console.warn(`[${l10nStrings.dialog.common.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.check.denied}`, new URL(requestUrl), permission);
        return false;
      }
      return returnValue;
    });
    win.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
      const returnValue = permissionHandler(webContents.getURL(), permission, details);
      if(returnValue === null) {
        console.warn("[" + l10nStrings.dialog.common.warning.toLocaleUpperCase() + "] " + l10nStrings.dialog.permission.request.denied, webContents.getURL(), permission);
        return callback(false);
      }
      return callback(returnValue);
    });
  }
  void win.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/load.html"));
  win.setAutoHideMenuBar(configData.get().settings.general.menuBar.hide);
  win.setMenuBarVisibility(!configData.get().settings.general.menuBar.hide);
  // Add English to the spellchecker
  {
    let valid = true;
    const spellCheckerLanguages = [app.getLocale(), "en-US"];
    if (app.getLocale() === "en-US") valid = false;
    if (valid && process.platform !== "darwin")
      for (const language of spellCheckerLanguages)
        if (!win.webContents.session.availableSpellCheckerLanguages.includes(language))
          valid = false;
    if (valid) win.webContents.session.setSpellCheckerLanguages(spellCheckerLanguages);
  }

  // Keep window state
  mainWindowState.watchState(win);

  // Load all menus:
  getMenu.context(win);
  const tray = !configData.get().settings.general.tray.disable ? getMenu.tray(win) : null;
  if(typeof packageJson.data.repository === "object")
    getMenu.bar(packageJson.data.repository.url, win);
  else
    throw new TypeError("'repository' in package.json is not of type 'object'.");

  // "Red dot" icon feature
  let setFavicon: string | undefined;
  win.webContents.on("page-favicon-updated", (_event, favicons) => {
    let icon: NativeImage, flash = false;
    // Convert from DataURL to RAW.
    const faviconRaw = nativeImage.createFromDataURL(favicons[0]??"").toBitmap();
    // Hash discord favicon.
    const faviconHash = createHash("sha1").update(faviconRaw).digest("hex");
    // Stop execution when icon is same as the one set.
    if (faviconHash === setFavicon) return;
    // Stop code execution on Fosscord instances.
    const currentInstance = knownInstancesList.find((value) => value[1].origin === new URL(win.webContents.getURL()).origin);
    if (currentInstance?.[2] !== true) {
      setFavicon = faviconHash;
      icon = appInfo.trayIcon;
      win.flashFrame(false);
      return;
    }

    // Compare hashes.
    if(faviconHash === discordFavicons.default) {
      icon = appInfo.trayIcon;
    } else if(faviconHash.startsWith("4")) {
      icon = appInfo.trayUnread;
    } else {
      console.debug("[Mention] Hash: "+faviconHash);
      icon = appInfo.trayPing;
      flash = true;
    }
    // Set tray icon and taskbar flash
    if(tray) {
      // Resize icon on MacOS when its height is longer than 22 pixels.
      if(process.platform === "darwin" && icon.getSize().height > 22)
        icon = icon.resize({height:22});
      tray.setImage(icon);
    }
    win.flashFrame(flash&&configData.get().settings.general.taskbar.flash);
    setFavicon = faviconHash;
  });

  // Window Title
  win.on("page-title-updated", (event, title) => {
    event.preventDefault();
    if (title.includes("Discord Test Client"))
      win.setTitle(app.getName() + " (Fosscord)");
    else if (title.includes("Discord") && !/[0-9]+/.test(win.webContents.getURL()))
      win.setTitle(title.replace("Discord",app.getName()));
    else
      win.setTitle(app.getName() + " - " + title);
  });

  // Insert custom css styles:

  win.webContents.on("did-finish-load", () => {
    if(new URL(win.webContents.getURL()).protocol === "https:") {
      loadStyles(win.webContents)
        .catch(commonCatches.print);
      import("fs")
        .then(fs => fs.promises.readFile)
        .then(read => read(resolve(app.getAppPath(), "sources/assets/web/css/discord.css")))
        .then(buffer => buffer.toString())
        .then(data => win.webContents.insertCSS(data))
        .catch(commonCatches.print);
    }
  });

  // Inject desktop capturer and block getUserMedia.
  ipcMain.on("api-exposed", (_event, api:unknown) => {
    if(typeof api !== "string") return;
    const safeApi = api.replaceAll("'","\\'");
    console.debug("[IPC] Exposing a `getDisplayMedia` and spoffing it as native method.");
    const functionString = `
    // Validate if API is exposed by
    if('${safeApi}' in window && typeof window['${safeApi}'] === "function" && !(delete window['${safeApi}'])) {
      const media = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = Function.prototype.call.apply(Function.prototype.bind, [(constrains) => {
        if(constrains?.audio?.mandatory || constrains?.video?.mandatory)
          return new Promise((resolve,reject) => setImmediate(() => reject(new DOMException("Invalid state.", "NotAllowedError"))));
        return media(constrains);
      }]);
      navigator.mediaDevices.getDisplayMedia = Function.prototype.call.apply(Function.prototype.bind, [
        () => window['${safeApi}'](${safeApi}).then(value => media(value)).catch(error => {
          if(typeof error === "string")
            throw new DOMException(error, "NotAllowedError");
          else
            throw error;
        })
      ]);
      Object.defineProperty(navigator.mediaDevices.getUserMedia, "name", {value: "getUserMedia"});
      Object.defineProperty(navigator.mediaDevices.getDisplayMedia, "name", {value: "getDisplayMedia"});
    }`;
    win.webContents.executeJavaScript(functionString + ";0")
      .then(() => internalWindowEvents.emit("api", safeApi))
      .catch(commonCatches.throw);
  });

  // Apply settings that doesn't need app restart on change
  ipcMain.on("settings-config-modified", (event, object:null|Partial<AppConfig["defaultConfig"]>) => {
    if(new URL(event.senderFrame.url).protocol !== "file:")
      return;
    const config = new AppConfig();
    // Menu bar
    if (object?.settings?.general.menuBar.hide !== undefined) {
      console.debug("[Settings] Updating menu bar state...");
      win.setAutoHideMenuBar(config.get().settings.general.menuBar.hide);
      win.setMenuBarVisibility(!config.get().settings.general.menuBar.hide);
    }
    // Custom Discord instance switch
    if(object?.settings?.advanced.currentInstance.radio !== undefined) {
      void win.loadURL(knownInstancesList[config.get().settings.advanced.currentInstance.radio][1].href);
    }
    // CSP
    if(
      object?.settings?.advanced.cspThirdParty !== undefined ||
      object?.settings?.advanced.csp !== undefined
    )
      win.reload();
    // Remove window flashing when it is disabled
    if(object?.settings?.general.taskbar.flash === false)
      win.flashFrame(false);
  });

  // Load extensions for builds of type "devel".
  if(getBuildInfo().type === "devel")
    void loadChromiumExtensions(win.webContents.session);
    
  // WebSocket server
  import("../modules/socket")
    .then(socket => socket.default)
    .then(startServer => startServer(win))
    .catch(commonCatches.print);
  
  // IPC events validated by secret "API" key and sender frame.
  internalWindowEvents.on("api", (safeApi:string) => {
    /** Determines whenever another request to desktopCapturer is in process. */
    let lock = false;
    ipcMain.removeHandler("desktopCapturerRequest");
    ipcMain.handle("desktopCapturerRequest", (event, api:unknown) => {
      if(safeApi !== api || event.senderFrame.url !== win.webContents.getURL()) return;
      return new Promise((resolvePromise) => {
        // Handle lock and check for a presence of another BrowserView.
        if(lock || win.getBrowserViews().length !== 0)
          return new Error("Main process is busy by another request.");
        // Fail when client has denied the permission to the capturer.
        if(!configData.get().settings.privacy.permissions["display-capture"])
          return new DOMException("Permission denied", "NotAllowedError");
        lock = !app.commandLine.getSwitchValue("enable-features")
          .includes("WebRTCPipeWireCapturer") ||
          process.env["XDG_SESSION_TYPE"] !== "wayland" ||
          process.platform === "win32";
        const sources = desktopCapturer.getSources({
          types: lock ? ["screen", "window"] : ["screen"],
          fetchWindowIcons: lock
        });
        if(lock) {
          const view = new BrowserView({
            webPreferences: {
              preload: resolve(app.getAppPath(), "app/code/renderer/preload/capturer.js")
            }
          });
          ipcMain.handleOnce("getDesktopCapturerSources", (event) => {
            if(event.sender === view.webContents)
              return sources;
            else
              return null;
          });
          const autoResize = () => setImmediate(() => view.setBounds({
            ...win.getBounds(),
            x:0,
            y:0,
          }));
          ipcMain.handleOnce("capturer-get-settings", () => {
            return new AppConfig().get().screenShareStore;
          });
          ipcMain.once("closeCapturerView", (_event,data:unknown) => {
            win.removeBrowserView(view);
            view.webContents.delete();
            win.removeListener("resize", autoResize);
            ipcMain.removeHandler("capturer-get-settings");
            resolvePromise(data);
            lock = false;
          });
          win.setBrowserView(view);
          void view.webContents.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/capturer.html"));
          view.webContents.once("did-finish-load", () => {
            autoResize();
            win.on("resize", autoResize);
          });
        } else {
          sources.then(sources => resolvePromise({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: sources[0]?.id
              }
            }
          })).catch(error => console.error(error));
        }
        return;
      });
    });
    ipcMain.removeAllListeners("paste-workaround");
    ipcMain.on("paste-workaround", (event, api:unknown) => {
      if(safeApi !== api || event.senderFrame.url !== win.webContents.getURL()) return;
      console.debug("[Clipboard] Applying workaround to the image...");
      win.webContents.paste();
    });
  });
  return win;
}