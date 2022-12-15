import { app, dialog } from "electron/main";
import kolor from "@spacingbat3/kolor";

export const commonCatches = {
  print: (reason:unknown) => {
    if(reason instanceof Error)
      console.error(reason.message);
    else
      console.error(reason);
  },
  throw: (reason:unknown) => {
    if(reason instanceof Error)
      throw reason;
    else if(typeof reason === "string")
      throw new Error(reason);
  }
};

async function handleWithGUI(wasReady:boolean, name:string, message:string, stack:string, stackColor:string, error:Error&NodeJS.ErrnoException) {
  if(!app.isReady()) await app.whenReady();
  let result = 0;
  let buttons:[string,string] = ["Abort", "Ignore"];
  if(new Date().getMonth() === 3 && new Date().getDate() === 1)
    // You saw nothing!
    buttons = ["Abort, abort!", "Not today, Satan!"];
  if(wasReady) console.error("\n" + kolor.red(kolor.bold(name)) + kolor.blue(message) + stackColor);
  result = dialog.showMessageBoxSync({
    title: name,
    message: error.message + stack,
    type: "error",
    buttons: buttons,
    cancelId: 0,
    defaultId: 0,
  });
  let errCode: number;
  switch (error.name) {
    case "Error":
      if (error.errno !== undefined || error.code !== undefined ||
          error.syscall !== undefined || error.path !== undefined)
        errCode = 99;
      else
        errCode = 101;
      break;
    case "TypeError":
      errCode = 102;
      break;
    case "SyntaxError":
      errCode = 103;
      break;
    case "RangeError":
      errCode = 104;
      break;
    case "EvalError":
      errCode = 105;
      break;
    case "RefferenceError":
      errCode = 106;
      break;
    case "URIError":
      errCode = 107;
      break;
    case "AggregateError":
      errCode = 108;
      break;
    default:
      errCode = 100;
  }
  if(result === 0) {
    console.error("\nApplication crashed (Error code: " + errCode.toString() + (error.errno !== undefined ? ", ERRNO: " + error.errno.toString() : "") + ")\n");
    app.exit(errCode);
  } else {
    console.warn([
      "Ignored an unhandled error. This may lead to undesirable consequences.",
      "You do this at your own risk!"
    ].join("\n"));
  }
}

/* Handles uncaughtException errors */

export default function uncaughtExceptionHandler(): void {
  process.removeAllListeners("uncaughtException").on("uncaughtException", (error:Error&NodeJS.ErrnoException) => {
    let wasReady = false;
    if(app.isReady()) wasReady = true;
    let stack = "", message = "", stackColor = "";
    const name = "UncaughtException: " + app.getName() + " threw '" + error.name + "'.";
    if (error.message !== "")
      message = "\n\n" + error.message;


    if (error.stack !== undefined) {
      stack = "\n" + error.stack
        .replace(error.name + ": " + error.message, "");
      stackColor = stack;
      const stackLines = stack.split(/\r\n|\n|\r/);
      const stackProcessed: string[] = [], stackColorProcessed: string[] = [];
      for (const line of stackLines) {
        const regexAppPath = app.getAppPath().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (line.match(RegExp("at.*\\(" + regexAppPath + ".*\\).*", "g"))) {
          let modifiedLine = line;
          const tsRule = /\(\/.*\.ts.*\)/.exec(line);
          if (tsRule?.[0] !== undefined)
            modifiedLine = line.replace(tsRule[0].replace(new RegExp("\\((" + regexAppPath + "\\/).*\\)"), "$1"), "");
          stackProcessed.push(modifiedLine);
          stackColorProcessed.push(modifiedLine);
        } else {
          stackColorProcessed.push(kolor.gray(line));
        }
      }
      if (error.message !== "")
        stack = "\n\n" + stackProcessed.join("\n");
      else
        stack = stackProcessed.join("\n");
      stackColor = stackColorProcessed.join("\n");
    }
    handleWithGUI(wasReady,name,message,stack,stackColor,error).catch(() => app.exit(200));
  });
}