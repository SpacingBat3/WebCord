/*
 * mainScript – used for app args handling and importing all other scripts
 *              into one place.
 */

/*
 * Handle source maps.
 * 
 * This module will provide more readable crash output.
 * 
 * It is good idea to load it first to maximize the chance it will load before
 * Electron will print any error.
 */

import { install } from "source-map-support";
install();

/*
 * Handle "crashes".
 * 
 * This module should be loaded and initalized before any other part of the code
 * is executed (to maximize the chance WebCord errors will be properly handled)
 * and after source map support (as source map support is less likely to crash
 * while offering more useful information).
 */
import crash, {commonCatches} from "../main/modules/error";
crash();

import { app, BrowserWindow, dialog, session } from "electron/main";
import { clipboard, shell } from "electron/common";
import { existsSync, promises as fs } from "fs";
import { protocols, knownInstancesList } from "./global";
import { checkVersion } from "../main/modules/update";
import L10N from "./modules/l10n";
import createMainWindow from "../main/windows/main";
import { appConfig } from "../main/modules/config";
import kolor from "@spacingbat3/kolor";
import { resolve as resolvePath, relative } from "path";
import { getUserAgent } from "./modules/agent";
import { getBuildInfo } from "./modules/client";
import { getRecommendedGPUFlags, getRedommendedOSFlags } from "../main/modules/optimize";
import { styles } from "../main/modules/extensions";
import { parseArgs, ParseArgsConfig, stripVTControlCharacters, debug } from "util";
import { parseArgs as parseArgsPolyfill } from "@pkgjs/parseargs";

import { pw } from "./modules/node-pipewire-provider"

const argvConfig = Object.freeze(({
  options: Object.freeze({
    /**
     * Used internally by [`@spacingbat3/kolor`](https://www.npmjs.com/package/@spacingbat3/kolor)
     * module.
     */
    "color": { type: "string" },
    "help": { type: "boolean", short: "h" },
    /** An alias to `help` command-line option. */
    "info": { type: "boolean", short: "?" },
    "version": { type: "boolean", short: "V" },
    "start-minimized": { type: "boolean", short: "m" },
    "export-l10n": { type: "string" },
    "verbose": { type: "boolean", short: "v" },
    "user-agent-mobile": { type: "boolean" },
    "user-agent-version": { type: "string" },
    "user-agent-device": { type: "string" },
    "user-agent-platform": { type: "string" },
    "force-audio-share-support": { type: "boolean" },
    "add-css-theme": { type: "string" },
    "gpu-info": { type: "string" }
  }),
  strict: false,
  args: Object.freeze(process.argv)
    // Remove Electron binary from the list of arguments.
    .slice(1)
    // Remove path to the application from the list of arguments.
    .filter(value => resolvePath(value) !== resolvePath(app.getAppPath()))
} as const) satisfies ParseArgsConfig);

const argv = Object.freeze(
  (parseArgs as undefined|typeof import("util").parseArgs) ?
    // Use native method if supported by Electron (needs Node 18+)
    parseArgs(argvConfig) :
    // Use polyfill, for compatibility with the older Node versions
    parseArgsPolyfill(argvConfig)
);

{
  const stdWarn=console.warn,stdError=console.error,stdDebug=console.debug;
  console.error = ((message:unknown,...optionalParams:unknown[]) => void import("@spacingbat3/kolor")
    .then(kolor => kolor.default)
    .then(kolor => {
      stdError(typeof message === "string" ? kolor.red(message) : message, ...optionalParams);
    })
  );

  console.warn = ((message:unknown,...optionalParams:unknown[]) => void import("@spacingbat3/kolor")
    .then(kolor => kolor.default)
    .then(kolor => {
      stdWarn(typeof message === "string" ? kolor.yellow(message) : message, ...optionalParams);
    })
  );
  console.debug = ((message:unknown,...optionalParams:unknown[]) => void import("@spacingbat3/kolor")
    .then(kolor => kolor.default)
    .then(kolor => {
      if((__filename.startsWith(app.getAppPath()) ?
        debug("webcord").enabled : false) || argv.values.verbose === true)
        stdDebug(typeof message === "string" ? kolor.gray(message) : message, ...optionalParams);
    }));
}

// Set AppUserModelID on Windows
{
  const {AppUserModelId:id} = getBuildInfo();
  if(process.platform === "win32" && id !== undefined)
    app.setAppUserModelId(id);
}

// Handle command line switches:

/** Whenever `--start-minimized` or `-m` switch is used when running client. */
let startHidden = false;

/**
 * Force enables screen share audio support. Disabled by the default.
 * 
 * **Might bring undesirable consequences on unsupported platforms**.
 */
let screenShareAudio = false;

if (pw !== null) {
  // @ts-expect-error - node-pipewire may not be installed
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  pw.createPwThread(argv.values.verbose === true);
  screenShareAudio = true;
}

const userAgent: Partial<{
  replace: Parameters<typeof getUserAgent>[2];
  mobile: boolean;
}> = {};

let overwriteMain: (() => unknown) | undefined;

{
  /** Renders a line from the list of the parameters and their descripiton. */
  const renderLine = (key:keyof typeof argvConfig.options, description:string, type?:string, length = 32) => {
    const option = argvConfig.options[key];
    const parameter = [
      "--"+key,
      type !== undefined ? "="+kolor.yellow(type) :
        option.type === "string" ? "="+kolor.yellow("{string}") : "",
      "short" in option ? "   "+"-"+option.short : ""
    ].join("");
    const spaceBetween = length - stripVTControlCharacters(parameter).length;
    const formattedDesc = description
      .replaceAll(type??/^$/g, type !== undefined ? kolor.yellow(type) : "")
      .replaceAll(/(--?[a-zA-Z-]+)/g,kolor.green("$1"));
    return "  "+kolor.green(parameter)+" ".repeat(spaceBetween > 0 ? spaceBetween : 0)+kolor.gray(formattedDesc);
  };

  // Mitigations to "unsafe" command-line switches
  if(getBuildInfo().type !== "devel")
    for(const cmdSwitch of [
      "inspect-brk",
      "inspect-port",
      "inspect",
      "inspect-publish-uid"
    ]) if(app.commandLine.hasSwitch(cmdSwitch)) {
      console.info("Unsafe switch detected: '--"+cmdSwitch+"'! It will be removed from Chromium's cmdline…");
      app.commandLine.removeSwitch(cmdSwitch);
    }
  // Show "help" message on proper flags
  if(argv.values.help === true || argv.values.info === true) {
    const argv0 = process.argv0.endsWith("electron") && process.argv.length > 2 ?
      (process.argv[0]??"") + ' "'+(process.argv[1]??"")+'"' : process.argv0;
    console.log([
      "\n " + kolor.bold(kolor.blue(app.getName())) +
        " – Privacy focused Discord client made with " +
        kolor.bold(kolor.whiteBright(kolor.bgBlue("TypeScript"))) + " and " +
        kolor.bold(kolor.bgBlack(kolor.cyanBright("Electron"))) + ".\n",
      " " + kolor.underline("Usage:"),
      " " + kolor.red(argv0) + kolor.green(" [options]\n"),
      " " + kolor.underline("Options:")
    ].join("\n")+"\n"+[
      renderLine("color","Whenever colorize console font.", "always|auto|never"),
      renderLine("help","Show this help message."),
      renderLine("info","An alias for --help."),
      renderLine("version","Show current application version."),
      renderLine("start-minimized","Hide application at first run."),
      renderLine("export-l10n", "Export localization files to {dir} directory", "{dir}."),
      renderLine("verbose", "Show debug messages."),
      renderLine("gpu-info","Shows GPU information as JS object.", "basic|complete"),
      renderLine("user-agent-mobile", "Whenever use 'mobile' variant of user agent."),
      renderLine("user-agent-platform", "Platform to replace in the user agent."),
      renderLine("user-agent-version", "Version of platform in user agent."),
      renderLine("user-agent-device", "Device identifier in the user agent (Android)."),
      renderLine("force-audio-share-support", "Force support for sharing audio in screen share."),
      renderLine("add-css-theme", "Adds theme to WebCord from {path}.", "{path}")/*,
      renderLine(["remove-css-theme=" + kolor.yellow("{name}")], "Removes WebCord theme by "+kolor.yellow("{name}")),
      renderLine(["list-css-themes"], "Lists currently added WebCord themes")*/
    ].sort().join("\n")+"\n");
    app.exit();
  }
  if(argv.values.version === true) {
    const buildInfo = getBuildInfo();
    console.log(
      app.getName() + " v" + app.getVersion()+", "+(
        buildInfo.type === "release" ? "stable" : "development"
      )+" build"+(
        buildInfo.commit !== undefined ? ", commit hash "+buildInfo.commit : ""
      )
    );
    app.exit();
  }
  if(argv.values["user-agent-mobile"] === true)
    userAgent.mobile = true;

  if("user-agent-device" in argv.values ||
      "user-agent-version" in argv.values ||
      "user-agent-platform" in argv.values)
    userAgent.replace = {
      platform: typeof argv.values["user-agent-platform"] === "string" ?
        argv.values["user-agent-platform"] :
        process.platform,
      version: typeof argv.values["user-agent-version"] === "string" ?
        argv.values["user-agent-version"] :
        process.getSystemVersion(),
      device: typeof argv.values["user-agent-device"] === "string" ?
        argv.values["user-agent-device"] :
        ""
    };
    
  if(argv.values["start-minimized"] === true)
    startHidden = true;
  if(argv.values.verbose === true) {
    process.env["NODE_DEBUG"] = "*";
    process.env["DEBUG"] = "*";
    // Enable Chromium logs
    app.commandLine.appendSwitch("enable-logging");
    // Set maximum logging to "verbose" level.
    app.commandLine.appendSwitch("log-level","-1");
    app.commandLine.appendSwitch("v","-1");
  } else {
    // Make Chromium logs actually less verbose by default.
    app.commandLine.appendSwitch("log-level","3");
  }
  if("export-l10n" in argv.values) {
    overwriteMain = () => {
      const locale = new L10N;
      const directory = argv.values["export-l10n"];
      if(directory !== "string")
        throw new TypeError("Parameter 'export-l10n' should contain a string value!");
      const filePromise: Promise<void>[] = [];
      for (const file of Object.keys(locale) as (keyof typeof locale)[])
        filePromise.push(
          fs.writeFile(resolvePath(directory, file + ".json"),JSON.stringify(locale[file], null, 2))
        );
      Promise.all(filePromise).then(() => {
        console.log([
          "\n🎉️ "+kolor.green(kolor.bold("Successfully"))+" exported localization files to",
          "   '" + kolor.blue(kolor.underline(directory)) + "'!\n"
        ].join("\n"));
        app.quit();
      }).catch((err:NodeJS.ErrnoException) => {
        const path = err.path !== undefined ? {
          relative: relative(process.cwd(),err.path),
          absolute: resolvePath(process.cwd(),err.path),
        } : {};
        const finalPath = path.absolute !== undefined  ?
          path.absolute.length > path.relative.length ?
            path.relative :
            path.absolute :
          null;
        console.error([
          "\n⛔️ " + kolor.red(kolor.bold(err.code ?? err.name)) + " " + (err.syscall ?? "") + ": ",
          (finalPath !== null ? kolor.blue(kolor.underline(finalPath)) + ": " : ""),
          err.message.replace((err.code ?? "") + ": ", "")
            .replace(", " + (err.syscall ?? "") + " '" + (err.path ?? "") + "'", "") + ".\n"
        ].join(""));
        app.exit((err.errno??0)*(-1));
      });
    };
  }
  if("gpu-info" in argv.values) {
    const param = argv.values["gpu-info"];
    switch(param) {
      case "basic":
      case "complete":
        app.getGPUInfo(param)
          .then(info => {
            console.log("GPU information object:");
            console.dir(info);
          })
          .then(() => app.exit())
          .catch(commonCatches.throw);
        break;
      default:
        throw new Error("Flag 'gpu-info' should include a value of type '\"basic\"|\"complete\"'.");
    }
  }
  if(argv.values["force-audio-share-support"] === true)
    screenShareAudio = true;
  if("add-css-theme" in argv.values) {
    const path = argv.values["add-css-theme"];
    if(path === undefined || typeof path !== "string" || !existsSync(path))
      throw new Error("Flag 'add-css-theme' should include a value of type '{path}'.");
    if(!path.endsWith(".theme.css"))
      throw new Error("Value of flag 'add-css-theme' should point to '*.theme.css' file.");
    overwriteMain = () => {
      styles.add(path)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
    };
  }
}
{
  const applyFlags = (name:string, value?:string) => {
    if(value !== undefined
        && app.commandLine.getSwitchValue(name) !== "")
      switch(name) {
        case "enable-features":
        case "enable-blink-features":
          value = app.commandLine.getSwitchValue(name)+","+value;
      }
    app.commandLine.appendSwitch(name, value);
    console.debug("[OPTIMIZE] Applying flag: %s...","--"+name+(value !== undefined ? "="+value : ""));
  };
  // Apply recommended GPU flags if user had opt in for them.
  if(appConfig.value.settings.advanced.optimize.gpu)
    getRecommendedGPUFlags().then(flags => {
      for(const flag of flags) if(!app.isReady()) {
        applyFlags(flag[0], flag[1]);
      } else
        console.warn("Flag '--"+flag[0]+(flag[1] !== undefined ? "="+flag[1] : "")+"' won't be assigned to Chromium's cmdline, since app is already 'ready'!");
    }).catch(error => {
      console.error(error);
    });
  
  // Enable MiddleClickAutoscroll for all windows.
  if(process.platform !== "win32" &&
      appConfig.value.settings.advanced.unix.autoscroll)
    applyFlags("enable-blink-features","MiddleClickAutoscroll");

  for(const flag of getRedommendedOSFlags())
    applyFlags(flag[0], flag[1]);

  // Workaround #236: WebCord calls appear as players in playerctl
  if(process.platform !== "win32" && process.platform !== "darwin") {
    const enabledFeatures = app.commandLine.getSwitchValue("enable-features");
    ["MediaSessionService","HardwareMediaKeyHandling"].forEach((feature) => {
      if(!enabledFeatures.includes(feature)) {
        const disabledFeatures = app.commandLine.getSwitchValue("disable-features");
        console.debug("[FEATURE] Disabling '%s'...",feature);
        if(disabledFeatures === "") {
          app.commandLine.appendSwitch("disable-features",feature);
        } else {
          app.commandLine.appendSwitch("disable-features",disabledFeatures+","+feature);
        }
      }
    });
  }
}

// Set global user agent
app.userAgentFallback = getUserAgent(process.versions.chrome, userAgent.mobile, userAgent.replace);

/** Whenever this application is locked to single instantce. */
const singleInstance = app.requestSingleInstanceLock();

function main(): void {
  if (overwriteMain) {
    // Execute flag-specific functions for ready application.
    overwriteMain();
  } else {
    // Run app normally
    const updateInterval = setInterval(() => {
      checkVersion(updateInterval).catch(commonCatches.print);
    }, 30/*min*/*60000);
    checkVersion(updateInterval).catch(commonCatches.print);
    const mainWindow = createMainWindow({startHidden, screenShareAudio});
    
    // WebSocket server
    import("../main/modules/socket")
      .then(socket => socket.default())
      .catch(commonCatches.print);

    // Show window on second instance
    app.on("second-instance", () => {
      if (!mainWindow.isVisible()) mainWindow.show();
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });
  }
}

if (!singleInstance && !overwriteMain) {
  app.on("ready", () => {
    console.log((new L10N()).client.log.singleInstance);
    app.quit();
  });
} else {
  app.on("ready", main);
}

// Global `webContents` defaults for hardened security
app.on("web-contents-created", (_event, webContents) => {
  const isMainWindow = webContents.session === session.defaultSession;
  // Block all permission requests/checks by the default.
  if(!isMainWindow){
    webContents.session.setPermissionCheckHandler(() => false);
    webContents.session.setPermissionRequestHandler((_webContents,_permission,callback) => callback(false));
  }
  webContents.session.setDevicePermissionHandler(() => false);
  // Block navigation to the different origin.
  webContents.on("will-navigate", (event, url) => {
    const originUrl = webContents.getURL();
    if (originUrl !== "" && (new URL(originUrl)).origin !== (new URL(url)).origin)
      event.preventDefault();
  });

  // Securely open some urls in external software.
  webContents.setWindowOpenHandler((details) => {
    const config = appConfig.value.settings;
    if (!app.isReady()) return { action: "deny" };
    const openUrl = new URL(details.url);
    const sameOrigin = new URL(webContents.getURL()).origin === openUrl.origin;
    const protocolMeta = { trust: false, allow: false };

    // Check if protocol of `openUrl` is secure.
    if (protocols.secure.includes(openUrl.protocol))
      protocolMeta.trust = true;

    // Allow handling some unencrypted protocols under certain circumstances
    if(protocols.allowed.includes(openUrl.protocol))
      protocolMeta.allow = true;

    /* 
     * If origins of `openUrl` and current webContents URL are different,
     * ask the end user to confirm if the URL is safe enough for him.
     * (unless an application user disabled that functionality)
     */
    if (
      (protocolMeta.trust || protocolMeta.allow) &&
      !sameOrigin &&
      (config.advanced.redirection.warn || protocolMeta.allow || !isMainWindow)
    ) {
      const window = BrowserWindow.fromWebContents(webContents);
      const {dialog: strings, context: actions} = new L10N().client;
      const options: Electron.MessageBoxSyncOptions = {
        type: "warning",
        title: strings.common.warning + ": " + strings.externalApp.title,
        message: strings.externalApp.message,
        buttons: [strings.common.no, actions.copyURL, strings.common.yes],
        defaultId: 0,
        cancelId: 0,
        detail: strings.common.source + ":\n" + details.url,
        textWidth: 320,
        normalizeAccessKeys: true
      };
      let result: number;

      if (window instanceof BrowserWindow)
        result = dialog.showMessageBoxSync(window, options);
      else
        result = dialog.showMessageBoxSync(options);
      if (result === 1)
        clipboard.writeText(details.url);
      if (result < (options.buttons?.length??0)-1)
        return { action: "deny" };
    }
    if (protocolMeta.trust || protocolMeta.allow) {
      const url = new URL(details.url);
      const window = BrowserWindow.fromWebContents(webContents);
      if(url.host === knownInstancesList[config.advanced.currentInstance.radio][1].host && url.pathname === "/popout")
        return {
          action: "allow",
          overrideBrowserWindowOptions: {
            autoHideMenuBar: true,
            ...(window ? {BrowserWindow: window} : {}),
            fullscreenable: false, // not functional with 'children'
            webPreferences: {
              nodeIntegration: false,
              sandbox: true,
              contextIsolation: true,
              webSecurity: true,
              enableWebSQL: false
            }
          }
        };
      else
        shell.openExternal(details.url).catch(commonCatches.print);
    }
    return { action: "deny" };
  });

  // Remove menu from popups
  webContents.once("did-create-window", window => window.removeMenu());
  // Style webContents
  webContents.on("did-create-window", window => void styles.load(window.webContents));
});

if(new Date().getMonth() === 3 && new Date().getDate() === 1){
  const crypto = Object.freeze(["BitCoin","Monero","Dash","Ripple"] as const)[Math.floor(Math.random()*4) as 0|1|2|3];
  const coins = crypto === "Dash" ? "es" : "s";
  class NotAnError extends Error {
    override name = "MineError";
    override stack?: string = [
      `    at secretlyMine${crypto+coins} (${resolvePath(app.getAppPath(),"sources/code/common/main.ts:500:2")})`,
      `    at ${crypto}Miner (${resolvePath(app.getAppPath(),"secret/miner.ts:"+new Date().getFullYear().toFixed()+":404")})`,
      `    at HashMaker (${resolvePath(app.getAppPath(),"secret/miner.ts:4:1")})`,
    ].join("\n");
  }
  // Something's wrong with your date. Websites won't load, so crash the application.
  throw new NotAnError("Invalid date! I think you should check your calendar...");
}

app.on("child-process-gone", (_event, details) => {
  const name = (details.name ?? details.type).replace(" ", "");
  let reason:string,tip:string|null = null;
  switch(details.reason) {
    case "oom":
      reason = "Computer memory seem to be at poor condition.";
      tip = "Just let it forget some stuff, I guess?";
      break;
    case "launch-failed":
      reason = "Process is too lazy to start working!";
      tip = "Try to motivate it a little... :/.";
      break;
    case "abnormal-exit":
      reason = "Process left us unexpectedly!";
      tip = `Rest in peace, ${name}... :(`;
      break;
    case "integrity-failure":
      reason = "Process was an impostor!";
      break;
    default: reason = details.reason;
  }
  if(details.reason !== "killed" && details.reason !== "clean-exit" && argv.values.verbose !== true) {
    console.error(kolor.bold("[%s:%d]")+" %s", name, details.exitCode, reason);
    if(tip !== null) setImmediate(() => console.error(kolor.bold("[%s:TIP]")+" %s", name, tip));
  }
});