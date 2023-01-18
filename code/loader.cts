// Built-in module imports.
import { dirname } from "node:path";
import { app, /*BrowserWindow, dialog, session*/ } from "electron/main";

// Path module loader to exclude module paths outside of application resources.
{
  const resources = dirname(app.getAppPath());
  module.paths = module.paths.filter(path => path.startsWith(resources));
}

// Setup support for source maps to map JavaScript to TypeScript.
import sourceMapSupport from "source-map-support";
sourceMapSupport.install({ environment: "node" });

// Import exception handlers and handle uncaught exceptions.
import exceptionHandler from "#cjs:/lib/exception";
process.on("uncaughtExceptionMonitor", exceptionHandler);

// ESM modules imports
const argv = import("#esm:/cli/argv");
const event = import("#esm:/lib/event");

Promise.all([argv,import("#esm:/lib/meta/build")]).then(([argv,meta]) => {
  const devel = meta.default().type === "devel";
  // Set log level based on build type
  argv.setLogLevel(devel);
  // Remove potentially unsafe flags from Chromium's cmdline
  if(devel) argv.proxyFlags();
  // Set fallback (default) user agent for all windows.
  app.userAgentFallback = argv.getUserAgent();
  // Print "help" message
  if(argv.flags["help"]) {
    argv.printHelp();
    app.exit(2);
  }
  // Print app "version"
  if(argv.flags["version"]) {
    argv.printVersion();
    app.exit(1);
  }
})

async function main() {
  const { flags } = await argv;
  const {  } = await event;
  
}

app.once("ready", async () => {
  if(app.requestSingleInstanceLock())
    await main();
  else
    app.exit();
});