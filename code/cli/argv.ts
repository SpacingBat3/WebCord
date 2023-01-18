import { app } from "electron/main";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  parseArgs,
  ParseArgsConfig,
  stripVTControlCharacters
} from "node:util";

import { parseArgs as parseArgsPolyfill } from "@pkgjs/parseargs";
import kolor from "@spacingbat3/kolor";

import getBuildInfo from "#esm:/lib/meta/build";
import { getUserAgent as buildUserAgent } from "#esm:/lib/window/userAgent";
//import { handler } from "#lib/exception";

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
    "add-css-theme": { type: "boolean" },
    "gpu-info": { type: "string" }
  }),
  strict: false,
  args: Object.freeze(process.argv)
    // Remove Electron binary from the list of arguments.
    .slice(1)
    // Remove path to the application from the list of arguments.
    .filter(value => resolve(value) !== resolve(app.getAppPath()))
} as const) satisfies ParseArgsConfig);

const switches = Object.freeze((
  (parseArgs as undefined|typeof import("util").parseArgs) ?
    // Use native method if supported by Electron (needs Node 18+)
    parseArgs(argvConfig) :
    // Use polyfill, for compatibility with the older Node versions
    parseArgsPolyfill(argvConfig)
).values);

export const flags = Object.freeze({
  help: switches["help"] === true || switches["info"] === true,
  version: switches["version"] === true,
  startHidden: switches["start-minimized"] === true,
  audioShare: switches["force-audio-share-support"] === true,
  verbose: switches["verbose"] === true
});

/** Renders a line from the list of the parameters and their descripiton. */
function renderLine(key:keyof typeof argvConfig.options, description:string, type?:string, length = 32) {
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

export function proxyFlags() {
  for(const cmdSwitch of [
    "inspect-brk",
    "inspect-port",
    "inspect",
    "inspect-publish-uid"
  ]) if(app.commandLine.hasSwitch(cmdSwitch)) {
    console.info("Unsafe switch detected: '--"+cmdSwitch+"'! It will be removed from Chromium's cmdline…");
    app.commandLine.removeSwitch(cmdSwitch);
  }
}

export function printHelp() {
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
}

export function printVersion() {
  const buildInfo = getBuildInfo();
  const commit = buildInfo.commit !== undefined ? ", commit hash "+buildInfo.commit : "";
  const type = buildInfo.type === "release" ? "stable" : "development";
  console.log(`${app.getName()} v${app.getVersion()}, ${type} build${commit}`);
  console.log("\n"+readFile(resolve(app.getAppPath(),"LICENSE")));
}

/** Generates user agent based on cmdline flags and `getUserAgent` function in `#lib  */
export function getUserAgent() {
  const userAgent: Partial<{
    mobile: boolean;
    replace: Parameters<typeof buildUserAgent>[2];
  }> = {};
  if(switches["user-agent-mobile"] === true)
    userAgent.mobile = true;
  if("user-agent-device" in switches || "user-agent-version" in switches ||
      "user-agent-platform" in switches)
    userAgent.replace = {
      platform: typeof switches["user-agent-platform"] === "string" ?
        switches["user-agent-platform"] :
        process.platform,
      version: typeof switches["user-agent-version"] === "string" ?
        switches["user-agent-version"] :
        process.getSystemVersion(),
      ...(typeof switches["user-agent-device"] === "string" ? {
        device: switches["user-agent-device"]
      } : {})
    };
  return buildUserAgent(process.versions.chrome,userAgent.mobile,userAgent.replace);
}

export function setLogLevel(verbose=false) {
  if(verbose) {
    // Show entire Node's debug log messages.
    process.env["NODE_DEBUG"] = "*";
    // Show logs emitted by `debug` module (some potential deps might use it).
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
}
/*
export function handleArgs() {
  const userAgent: Partial<Record<"platform"|"device",string>&Record<"mobile",boolean>> = {};
  // Mitigations to "unsafe" command-line switches
  if(getBuildInfo().type !== "devel")
    
  // Show "help" message on proper flags
  if(switches.help === true || switches.info === true) {
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
      renderLine("add-css-theme", "Adds theme to WebCord from {path}.", "{path}")
      renderLine(["remove-css-theme=" + kolor.yellow("{name}")], "Removes WebCord theme by "+kolor.yellow("{name}")),
      renderLine(["list-css-themes"], "Lists currently added WebCord themes")
    ].sort().join("\n")+"\n");
    app.exit();
  }
  if(switches.version === true) {
    
    app.exit();
  }
  if(switches["user-agent-mobile"] === true)
    userAgent.mobile = true;

  
    
  if(switches.values["start-minimized"] === true)
    startHidden = true;
  if(switches.values.verbose === true) {
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
  if("export-l10n" in switches.values) {
    overwriteMain = () => {
      const locale = new L10N;
      const directory = switches.values["export-l10n"];
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
  if("gpu-info" in switches) {
    const param = switches["gpu-info"];
    switch(param) {
      case "basic":
      case "complete":
        app.getGPUInfo(param)
          .then(info => {
            console.log("GPU information object:");
            console.dir(info);
          })
          .then(() => app.exit())
          .catch(handler.throw);
        break;
      default:
        throw new Error("Flag 'gpu-info' should include a value of type '\"basic\"|\"complete\"'.");
    }
  }
  if(switches.values["force-audio-share-support"] === true)
    screenShareAudio = true;
  if("add-css-theme" in switches.values) {
    const path = switches.values["add-css-theme"];
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
}*/