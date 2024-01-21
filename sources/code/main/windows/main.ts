import { EventEmitter } from "events";
import { resolve } from "path";

import kolor from "@spacingbat3/kolor";

import { appInfo, getBuildInfo } from "../../common/modules/client";
import { AppConfig, appConfig, WinStateKeeper } from "../modules/config";
import {
  app,
  dialog,
  BrowserWindow,
  net,
  ipcMain,
  desktopCapturer,
  BrowserView,
  systemPreferences
} from "electron/main";
import * as getMenu from "../modules/menu";
import { fonts, knownInstancesList } from "../../common/global";
import packageJson from "../../common/modules/package";
import { getWebCordCSP } from "../modules/csp";
import L10N from "../../common/modules/l10n";
import { loadChromiumExtensions, styles } from "../modules/extensions";
import { commonCatches } from "../modules/error";

import type { PartialRecursive } from "../../common/global";
import { nativeImage } from "electron/common";
import { satisfies as rSatisfies } from "semver";

import { setupScreenShareWithPW } from "../../common/modules/node-pipewire-provider";

interface MainWindowFlags {
  startHidden: boolean;
  screenShareAudio: boolean;
}

interface AudioInformation {
  selectedAudioNodes: string[] | null;
}

const blacklistInputNodes: number[] = [];

export default function createMainWindow(flags:MainWindowFlags): BrowserWindow {
  
  let pipewireAudio = false;
  
  import("node-pipewire").then((pw) => {
    let testAudioAttempts = 0;
    const testAudioInterval = setInterval(() => {
      // get the actual input nodes from pipewire.
      const inputNodes = pw.getInputNodes();
    
      if (inputNodes.length > 0) {
        //If the user is using a chromium based browser, and is using a microphone, it will be in the list of input nodes.
        const chromiumInputNodes = inputNodes.filter((node: { name: string }) => node.name === "Chromium");
    
        if (chromiumInputNodes.length > 0) {
          chromiumInputNodes.forEach((node: { id: number }) => {
            blacklistInputNodes.push(node.id);
          });
        }
        flags.screenShareAudio = true;
        pipewireAudio = true;
        clearInterval(testAudioInterval);
      } else{
        testAudioAttempts++;
        if (testAudioAttempts === 5) {
          clearInterval(testAudioInterval);
        }
      }
    }, 1000);
  }).catch((error) => {
    console.log("Error testing audio");
    console.error(error);
  });
    
  const l10nStrings = new L10N().client;

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
    transparent: appConfig.value.settings.general.window.transparent,
    show: false,
    webPreferences: {
      preload: resolve(app.getAppPath(), "app/code/renderer/preload/main.js"),
      nodeIntegration: false, // Never set to "true"!
      contextIsolation: true, // Isolates website from preloads.
      sandbox: false, // Removes Node.js from preloads (TODO).
      devTools: true, // Allows the use of the devTools.
      defaultFontFamily: fonts,
      enableWebSQL: false,
      webgl: appConfig.value.settings.advanced.webApi.webGl,
      safeDialogs: true, // prevents dialog spam by the website
      autoplayPolicy: "no-user-gesture-required"
    },
    ...(process.platform !== "win32" ? {icon: appInfo.icons.app} : {}),
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
        void win.loadURL(knownInstancesList[appConfig.value.settings.advanced.currentInstance.radio][1].href);
      }
    }, 1000);
  });
  win.webContents.once("did-finish-load", () => {
    console.debug("[PAGE] Starting to load the Discord page...");
    if (!flags.startHidden) win.show();
    setTimeout(() => {void win.loadURL(knownInstancesList[appConfig.value.settings.advanced.currentInstance.radio][1].href);}, 1500);
  });
  if (mainWindowState.initState.isMaximized)
    if(!flags.startHidden || win.isVisible())
      win.maximize();
    else
      win.once("show", () => win.maximize());

  // CSP

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const {csp,cspThirdParty} = appConfig.value.settings.advanced;
    const responseHeaders = details.responseHeaders??{};
    if(csp.enabled)
      responseHeaders["Content-Security-Policy"] = [getWebCordCSP(cspThirdParty)];
    callback({ responseHeaders });
  });

  win.webContents.session.webRequest.onBeforeRequest(
    {
      urls: [
        "https://*/cdn-cgi/**",
        "https://*/api/*/science",
        "https://*/api/*/channels/*/typing",
        "https://*/api/*/track"
      ]
    },
    (details, callback) => {
      const {
        science,
        fingerprinting,
        typingIndicator
      } = appConfig.value.settings.privacy.blockApi;
      /** Parsed URL of the request. */
      const url = new URL(details.url);
      if (science || typingIndicator || fingerprinting)
        console.debug("[API] Blocking " + url.pathname);
      if (url.pathname.endsWith("/science") || url.pathname.endsWith("/track"))
        callback({ cancel: science });
      else if (url.pathname.endsWith("/typing"))
        callback({ cancel: typingIndicator });
      else if (url.pathname.endsWith("/api.js") || url.pathname.startsWith("/cdn-cgi/"))
        callback({ cancel: fingerprinting });
      else
        callback({ cancel: false });
    },
  );
  // (Device) permissions check/request handlers:
  {
    /** List of domains, urls or protocols accepted by permission handlers. */
    const trustedURLs = [
      knownInstancesList[appConfig.value.settings.advanced.currentInstance.radio][1].origin,
      "devtools://"
    ];
    const getMediaTypesPermission = (mediaTypes: unknown[] = []) => {
      const supportsMediaAccessStatus = ["darwin","win32"].includes(process.platform);
      if(mediaTypes.length === 0)
        return (
          supportsMediaAccessStatus ?
            systemPreferences.getMediaAccessStatus("screen") === "granted" :
            true
        ) && (
          appConfig.value.settings.privacy.permissions["display-capture"]
        );
      return [...new Set(mediaTypes)]
        .map(media => {
          const mediaType = media === "video" ? "camera" : media === "audio" ? "microphone" : null;
          return mediaType !== null ? (
            supportsMediaAccessStatus ?
              systemPreferences.getMediaAccessStatus(mediaType) === "granted" :
              true
          ) : null;
        })
        .reduce((previousValue,currentValue) => (previousValue??false) && (currentValue??false))??true;
    };
    /** Common handler for  */
    const permissionHandler = (type:"request"|"check",webContentsUrl:string, permission:string, details:Electron.PermissionRequestHandlerHandlerDetails|Electron.PermissionCheckHandlerHandlerDetails):boolean|null => {
      // Verify URL address of the permissions.
      try {
        const webContents = new URL(webContentsUrl);
        if(webContents.origin !== trustedURLs[0] && webContents.protocol !== trustedURLs[1]) {
          console.debug("[PERM]: Origin of request for '%s' not trusted.", permission);
          return false;
        }
      } catch {
        // Deny invalid URLs (and show warning).
        return null;
      }
      switch (permission) {
        case "media":{
          let callbackValue = true;
          if("mediaTypes" in details) {
            callbackValue = getMediaTypesPermission(details.mediaTypes);
            for(const type of [...new Set(details.mediaTypes)])
              if(!callbackValue)
                break;
              else
                callbackValue = appConfig.value.settings.privacy.permissions[type]??false;
          }
          else if("mediaType" in details && details.mediaType !== "unknown")
            callbackValue = getMediaTypesPermission([details.mediaType]) && (
              appConfig.value.settings.privacy.permissions[details.mediaType]??false
            );
          else if(parseInt(process.versions.electron.split(".",1)[0]??"0") > 20)
            callbackValue = type === "request";
          else
            callbackValue = false;
          if(!callbackValue)
            console.debug("[PERM]: Permission denied for a request to media.");
          return callbackValue;
        }
        case "notifications":
        case "fullscreen":
        case "background-sync":
          return appConfig.value.settings.privacy.permissions[permission]??false;
        default:
          return null;
      }
    };
    win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
      const requestUrl = (webContents !== null && webContents.getURL() !== "" ? webContents.getURL() : requestingOrigin);
      const returnValue = permissionHandler("check",requestUrl,permission,details);
      if(returnValue === null) {
        console.warn(
          `[${l10nStrings.dialog.common.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.check.denied}`,
          new URL(requestUrl),
          permission
        );
        return false;
      }
      return returnValue;
    });
    win.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
      type nullPermissions = "video"|"audio"|"notifications";
      const dialogLock = new Set<nullPermissions>();
      async function permissionDialog(permission:nullPermissions) {
        if(dialogLock.has(permission)) return false;
        dialogLock.add(permission);
        const {response} = await dialog.showMessageBox(win,{
          type: "question",
          title: l10nStrings.dialog.permission.question.title,
          message: l10nStrings.dialog.permission.question.message.replace("%s", l10nStrings.dialog.permission.question[permission]),
          buttons: [l10nStrings.dialog.common.no, l10nStrings.dialog.common.yes],
          defaultId: 0,
          cancelId: 0,
          normalizeAccessKeys: true
        });
        dialogLock.delete(permission);
        const value = response === 1;
        const config = appConfig.value;
        config.settings.privacy.permissions[permission] = value;
        appConfig.value = config;
        return value;
      }
      const returnValue = permissionHandler("request",webContents.getURL(), permission, details);
      switch(returnValue) {
        // WebCord does not recognize the permission – it should be denied.
        case null:
          console.warn("[" + l10nStrings.dialog.common.warning.toLocaleUpperCase() + "] " + l10nStrings.dialog.permission.request.denied, webContents.getURL(), permission);
          callback(false);
          break;
        // Both WebCord and system allows for the permission.
        case true:
          callback(true);
          break;
        // Either WebCord or system denies the request.
        default:
          if(permission === "media") {
            const promises:Promise<boolean>[] = [];
            (["camera","microphone"] as const).forEach(media => {
              const permission = media === "camera" ? "video" : "audio";
              if(!(details.mediaTypes?.includes(permission)??false))
                return;
              // macOS: try asking for media access whenever possible.
              if(process.platform === "darwin" && systemPreferences.getMediaAccessStatus(media) === "not-determined")
                promises.push(systemPreferences.askForMediaAccess(media));
              // any: Ask user for permission if it is set to "null"
              if(appConfig.value.settings.privacy.permissions[permission] === null)
                promises.push(permissionDialog(permission));
              else
                promises.push(Promise.resolve(appConfig.value.settings.privacy.permissions[permission] === true));
            });
            if(promises.length === 0)
              Promise.all(promises)
                // Re-check permissions and return their values.
                .then(dialogs => dialogs.reduce((prev,cur) => prev && cur, true))
                .then(result => result && getMediaTypesPermission(details.mediaTypes))
                .then(result => callback(result))
                // Deny on failure.
                .catch(() => callback(false));
            else
              // Deny if no changes were done.
              callback(false);
            break;
          } else if(permission === "notifications" && appConfig.value.settings.privacy.permissions.notifications === null)
            permissionDialog(permission)
              .then(value => callback(value))
              .catch(() => callback(false));
          else
            callback(false);
          break;
      }
    });
  }
  void win.loadFile(resolve(app.getAppPath(), "sources/assets/web/html/load.html"));
  win.setAutoHideMenuBar(appConfig.value.settings.general.menuBar.hide);
  win.setMenuBarVisibility(!appConfig.value.settings.general.menuBar.hide);
  // Add English to the spellchecker
  if(process.platform !== "darwin") {
    let valid = true;
    const spellCheckerLanguages = [app.getLocale(), "en-US"];
    if (app.getLocale() === "en-US") valid = false;
    if (valid) for (const language of spellCheckerLanguages)
      if (!win.webContents.session.availableSpellCheckerLanguages.includes(language))
        valid = false;
    if (valid)
      win.webContents.session.setSpellCheckerLanguages(spellCheckerLanguages);
  }

  // Keep window state
  mainWindowState.watchState(win);

  // Close children on hide.
  win.on("hide", () => win.getChildWindows().forEach(child => child.close()));

  // Load all menus:
  getMenu.context(win);
  const tray = !appConfig.value.settings.general.tray.disable ? getMenu.tray(win) : null;
  if(typeof packageJson.data.repository === "object")
    getMenu.bar(packageJson.data.repository.url, win);
  else
    throw new TypeError("'repository' in package.json is not of type 'object'.");

  let lastStatus:boolean|null = null;
  const pluralRules = new Intl.PluralRules();
  // Window Title & "red dot" icon feature
  win.on("page-title-updated", (event, title) => {
    event.preventDefault();
    if (title.includes("Discord Test Client"))
      win.setTitle(app.getName() + " (Fosscord)");
    else if (title.includes("|")) {
      // Wrap new title style!
      const sections = title.split("|");
      const [dirty,client,section,group] = [
        (sections[0]?.includes("•")??false)
          ? true
          : (sections[0]?.includes("(")??false)
            ? sections[0]?.match(/\(([0-9]+)\)/)?.[1] ?? "m"
            : false,
        app.getName(),
        sections[1]?.trim() ?? "",
        sections[2]?.trim() ?? null
      ];
      // Fetch status for ping and title from current title
      const status=typeof dirty === "string" ? true : dirty ? false : null;
      win.setTitle((status === true ? "["+dirty+"] " : status === false ? "*" : "") + client + " - " + section + (group !== null ? " ("+group+")" : ""));
      if(lastStatus === status || !tray) return;
      // Set tray icon and taskbar flash
      {
        let icon: Electron.NativeImage, flash = false, tooltipSuffix="";
        switch(status) {
          case true:
            icon = appInfo.icons.tray.warn;
            flash = true;
            tooltipSuffix=` - ${dirty} ${l10nStrings.tray.mention[pluralRules.select(parseInt(`${dirty}`))]}`;
            break;
          case false:
            icon = appInfo.icons.tray.unread;
            break;
          default:
            icon = appInfo.icons.tray.default;
        }
        // Resize icon on MacOS when its height is longer than 22 pixels.
        if(process.platform === "darwin" && icon.getSize().height > 22)
          icon = icon.resize({height:22});
        tray.setImage(icon);
        tray.setToolTip(`${app.getName()}${tooltipSuffix}`);
        win.flashFrame(flash&&appConfig.value.settings.general.taskbar.flash);
      }
      lastStatus = status;
    }
    else if (title.includes("Discord") && !/[0-9]+/.test(win.webContents.getURL()))
      win.setTitle(title.replace("Discord",app.getName()));
    else
      win.setTitle(app.getName() + " - " + title);
  });

  // Insert custom css styles:

  win.webContents.on("did-navigate", () => {
    if(new URL(win.webContents.getURL()).protocol === "https:") {
      styles.load(win.webContents)
        .catch(commonCatches.print);
      import("fs")
        .then(fs => fs.promises.readFile)
        .then(read => read(resolve(app.getAppPath(), "sources/assets/web/css/discord.css")))
        .then(buffer => buffer.toString())
        .then(data => win.webContents.insertCSS(data))
        .catch(commonCatches.print);
      // Additionally, make window transparent if user has opted for it.
      if(appConfig.value.settings.general.window.transparent)
        win.webContents.once("did-stop-loading", () => win.setBackgroundColor("#0000"));
    }
  });

  // Inject desktop capturer and block getUserMedia.
  ipcMain.on("api-exposed", (_event, api:unknown) => {
    if(typeof api !== "string") return;
    const safeApi = api.replaceAll("'","\\'");
    console.debug("[IPC] Exposing a `getDisplayMedia` and spoofing it as native method.");
    const functionString = `
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
  ipcMain.on("settings-config-modified", (event, object:null|PartialRecursive<AppConfig>) => {
    if(new URL(event.senderFrame.url).protocol !== "file:")
      return;
    try {
      // Menu bar
      if (object?.settings?.general?.menuBar?.hide !== undefined) {
        console.debug("[Settings] Updating menu bar state...");
        win.setAutoHideMenuBar(appConfig.value.settings.general.menuBar.hide);
        win.setMenuBarVisibility(!appConfig.value.settings.general.menuBar.hide);
      }
      // Custom Discord instance switch
      if(object?.settings?.advanced?.currentInstance?.radio !== undefined) {
        void win.loadURL(knownInstancesList[appConfig.value.settings.advanced.currentInstance.radio][1].href);
      }
      // CSP
      if(
        object?.settings?.advanced?.cspThirdParty !== undefined ||
        object?.settings?.advanced?.csp !== undefined
      )
        win.reload();
      // Remove window flashing when it is disabled
      if(object?.settings?.general?.taskbar?.flash === false)
        win.flashFrame(false);
    } catch(error) {
      commonCatches.print(error);
    }
  });

  // Load extensions for builds of type "devel".
  if(getBuildInfo().type === "devel")
    void loadChromiumExtensions(win.webContents.session);
  
  /**
   * Whenever `desktopCapturer.getSources()` API is expected to crash
   * with current Electron version the application is running on.
   */
  const capturerApiSafe = rSatisfies(
    process.versions.electron,
    "<22.0.0 || >=26.0.0"
  );

  ipcMain.handle("getActualSources", async (_, params: {skipScreenSearch?: boolean}) => {
    const lock = !app.commandLine.getSwitchValue("enable-features")
      .includes("WebRTCPipeWireCapturer") ||
      process.env["XDG_SESSION_TYPE"] !== "wayland" ||
      process.platform === "win32";

    const skipScreenSearch = params.skipScreenSearch ?? false;
  
    const sources = !skipScreenSearch && (lock || capturerApiSafe) ?
    // Use desktop capturer on Electron 22 downwards or X11 systems
      desktopCapturer.getSources({
        types: lock ? ["screen", "window"] : ["screen"],
        fetchWindowIcons: lock,
        thumbnailSize: lock ? {width: 150, height: 150 } : {width: 0, height: 0}
        // Workaround #328: Segfault on `desktopCapturer.getSources()` since Electron 22
      }) : Promise.resolve([{
        id: "screen:1:0",
        appIcon: nativeImage.createEmpty(),
        display_id: "",
        name: "Entire Screen",
        thumbnail: nativeImage.createEmpty()
      } satisfies Electron.DesktopCapturerSource]);

    if(pipewireAudio) {
      const pw = await import("node-pipewire");

      const outputNodesName = pw.getOutputNodesName();

      // Because Webcord is detected as 'Chromium', we need to remove it from the blacklist
      const chromiumInputNodes = pw.getInputNodes().filter((node: { name: string; id: number }) => node.name.startsWith("Chromium") && !blacklistInputNodes.includes(node.id));
      const newBlacklistInputNodes: number[] = chromiumInputNodes.map((node) => node.id);
      blacklistInputNodes.push(...newBlacklistInputNodes);

      // Filter outputNodesName to remove the repeated names
      const outputNodesNameFiltered = outputNodesName.filter((node, index) => {
        return outputNodesName.indexOf(node) === index;
      }).sort();

      return [await sources, flags.screenShareAudio, outputNodesNameFiltered];
    }

    return [await sources, flags.screenShareAudio];
  });

  // IPC events validated by secret "API" key and sender frame.
  internalWindowEvents.on("api", (safeApi:string) => {
    /** Determines whenever another request to desktopCapturer is processed. */
    let lock = false;
    ipcMain.removeHandler("desktopCapturerRequest");
    ipcMain.handle("desktopCapturerRequest", (event, api:unknown) => {
      if(safeApi !== api || event.senderFrame.url !== win.webContents.getURL()) return;
      return new Promise((resolvePromise) => {
        // Handle lock and check for a presence of another BrowserView.
        if(lock || win.getBrowserViews().length !== 0)
          return new Error("Main process is busy by another request.");
        // Fail when client has denied the permission to the capturer.
        if(!appConfig.value.settings.privacy.permissions["display-capture"]) {
          resolvePromise("Permission denied");
          return;
        }
        lock = !app.commandLine.getSwitchValue("enable-features")
          .includes("WebRTCPipeWireCapturer") ||
          process.env["XDG_SESSION_TYPE"] !== "wayland" ||
          process.platform === "win32";
        
        const sources = lock || capturerApiSafe ?
        // Use desktop capturer on Electron 22 downwards or X11 systems
          desktopCapturer.getSources({
            types: lock ? ["screen", "window"] : ["screen"],
            fetchWindowIcons: lock,
            thumbnailSize: lock ? {width: 150, height: 150 } : {width: 0, height: 0}
            // Workaround #328: Segfault on `desktopCapturer.getSources()` since Electron 22
          }) : Promise.resolve([{
            id: "screen:1:0",
            appIcon: nativeImage.createEmpty(),
            display_id: "",
            name: "Entire Screen",
            thumbnail: nativeImage.createEmpty()
          } satisfies Electron.DesktopCapturerSource]);

        let capturerJS = "app/code/renderer/preload/capturer.js";
        let capturerHTML = "sources/assets/web/html/capturer.html";

        if (pipewireAudio) {
          capturerJS = "app/code/renderer/preload/pipewire-capturer.js";
          capturerHTML = "sources/assets/web/html/pipewire-capturer.html";
        }
        
        const view = new BrowserView({
          webPreferences: {
            preload: resolve(app.getAppPath(), capturerJS),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            enableWebSQL: false,
            webgl: false,
            autoplayPolicy: "user-gesture-required"
          }
        });
        
        if (!pipewireAudio){
          ipcMain.handleOnce("getDesktopCapturerSources", async (event) => {
            if(event.sender === view.webContents)
              return [await sources, flags.screenShareAudio];
            else
              return null;
          });
        } else {
          ipcMain.handleOnce("getDesktopCapturerSources", async (event) => {
            const pw = await import("node-pipewire");
            
            const outputNodesName = pw.getOutputNodesName();

            // Because Webcord is detected as 'Chromium', we need to remove it from the blacklist
            const chromiumInputNodes = pw.getInputNodes().filter((node: { name: string; id: number }) => node.name.startsWith("Chromium") && !blacklistInputNodes.includes(node.id));
            const newBlacklistInputNodes: number[] = chromiumInputNodes.map((node) => node.id);
            blacklistInputNodes.push(...newBlacklistInputNodes);

            // Filter outputNodesName to remove the repeated names
            const outputNodesNameFiltered = outputNodesName.filter((node, index) => {
              return outputNodesName.indexOf(node) === index;
            }).sort();

            if(event.sender === view.webContents)
              return [await sources, flags.screenShareAudio, outputNodesNameFiltered];
            else
              return null;
          });
        }
        const autoResize = () => setImmediate(() => view.setBounds({
          ...win.getBounds(),
          x:0,
          y:0,
        }));
        ipcMain.handleOnce("capturer-get-settings", () => {
          return appConfig.value.screenShareStore;
        });
        ipcMain.once("closeCapturerView", (_event, data: unknown, audioInfo?: AudioInformation) => {
          win.removeBrowserView(view);
          view.webContents.delete();
          win.removeListener("resize", autoResize);
          ipcMain.removeHandler("capturer-get-settings");


          if(audioInfo?.selectedAudioNodes){
            const selectedAudioNodes = audioInfo.selectedAudioNodes;

            if (selectedAudioNodes.length > 0) {
              setupScreenShareWithPW(selectedAudioNodes).catch((error) => {
                console.error(error);
              });
            }
          }
        
          resolvePromise(data);
          lock = false;
        });
        win.setBrowserView(view);
        void view.webContents.loadFile(resolve(app.getAppPath(), capturerHTML));
        view.webContents.once("did-finish-load", () => {
          autoResize();
          win.on("resize", autoResize);
        });
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