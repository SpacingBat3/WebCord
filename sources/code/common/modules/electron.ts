/* electron.ts – electron-specific functions made to work independently of its process. */
import { app } from "electron/main";
import { existsSync } from "fs";
import { resolve } from "path";
import { promises as fso } from "node:original-fs";
import { createHash, getHashes } from "crypto";
import type { BinaryToTextEncoding } from "crypto";

function catchAndThrowErrors (error:unknown) {
  if(error instanceof Error)
    throw error;
}

/** The current application directory. Cross-process safe method. */
export function getAppPath() {
  if (process.type === "browser")
    return app.getAppPath();
  else {
    // Calculate the project's directory based on the `package.json` position.
    let path = __dirname;
    while(!existsSync(resolve(path, "./package.json")) && !/^(?:\/|[A-Z]:\\)$/.test(path))
      path = resolve(path, "../");
    return path;
  }
}

/** Show a message box. Cross-process safe method. */
export function showMessageBox(options: Electron.MessageBoxOptions): void {
  if (process.type === "browser") {
    import("electron")
      .then(api => api.dialog.showMessageBox(options))
      .catch(catchAndThrowErrors);
  } else {
    const title = options.title !== undefined ? options.title + "\n" : "";
    alert(title + options.message);
  }
}

/** The current application locale. Cross-process safe method. */
export function getLocale() {
  if (process.type === "browser") {
    return process.platform !== "win32" || app.isReady() ?
      // Default method
      app.getLocale() :
      // Fallback on Windows.
      app.getLocaleCountryCode().toLowerCase();
  } else
    return navigator.language;
}

/**
 * The current application name (fallbacks to `the application` on renderer
 * process). Cross-process safe method.
 * */
export function getName() {
  if (process.type === "browser")
    return app.getName();
  else
    return "the application";
}

/**
 * Get hash of current `app.asar` file in given algorithm.
 */
export async function getAppHash(algorithm = "sha512", encoding:BinaryToTextEncoding = "hex") {
  const file = getAppPath();
  if(!getHashes().includes(algorithm))
    throw new Error("Unsuported hashing algorithm: "+algorithm);
  if((await fso.stat(file)).isFile())
    return fso.readFile(file)
      .then(buffer => createHash(algorithm).update(buffer).digest(encoding));
  return;
}