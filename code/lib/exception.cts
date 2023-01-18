import { app, dialog } from "electron/main";
import kolor from "@spacingbat3/kolor";

export const handler = Object.freeze({
  print: (message:unknown) => {
    if(message instanceof Error)
      console.error(message.message);
    else
      console.error(message);
  },
  throw: (message:unknown) => {
    if(message instanceof Error)
      throw message;
    throw new Error(String(message));
  }
} satisfies Record<string, (message:unknown) => void>);

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
    process.exitCode = errCode;
    app.quit();
  } else {
    console.warn([
      "Ignored an unhandled error. This may lead to undesirable consequences.",
      "You do this at your own risk!"
    ].join("\n"));
  }
}

/**
 * A generic handler for uncaught exceptions, capable of continuing with 
 */
export default function exceptionHandler(error:Error&NodeJS.ErrnoException) {
  const wasReady = app.isReady();
  const name = `Exception: '${error.name}' occured in ${app.getName()}.`;
  let stack = "", message = "", stackColor = "";
  if (error.message !== "")
    message = "\n\n" + error.message;
  if (error.stack !== undefined) {
    stack = "\n" + error.stack
      .replace(error.name + ": " + error.message, "");
    const stackLines = stack.split(/\r\n|\n|\r/);
    const stackProcessed: string[] = [], stackColorProcessed: string[] = [];
    const stackRegExp = RegExp(`(?<=at.*)\\((${app.getAppPath().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/).*\\)`,"g");
    stackColor = stack;
    for (const line of stackLines) if (stackRegExp.test(line)) {
      let modifiedLine = line;
      const tsRule = /\(\/.*\.ts.*\)/.exec(line);
      if (tsRule?.[0] !== undefined)
        modifiedLine = line.replace(tsRule[0].replace(stackRegExp, "$1"), "");
      stackProcessed.push(modifiedLine);
      stackColorProcessed.push(modifiedLine);
    } else {
      stackColorProcessed.push(kolor.gray(line));
    }
    if (error.message !== "")
      stack = "\n\n" + stackProcessed.join("\n");
    else
      stack = stackProcessed.join("\n");
    stackColor = stackColorProcessed.join("\n");
  }
  handleWithGUI(wasReady,name,message,stack,stackColor,error).catch(() => app.exit(200));
};