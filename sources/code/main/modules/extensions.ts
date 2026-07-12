import { app, dialog } from "electron/main";
import { resolve as resolveUrl } from "url";
import { commonCatches } from "./error";
import { resolve as resolveFs, basename } from "path";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { statSync, watch } from "fs";

const safeStoragePromise = (import("electron/main"))
  .then(main => main.safeStorage);

async function fetchOrRead(url:URL, signal?:AbortSignal) {
  if(url.protocol === "file:")
    return { read: readFile(url.pathname, {signal}) };
  else
    return { download: fetch(url.href, signal ? {signal} : {})};
}

/**
 * A function that recursively parses `@import` CSS statements, so they can be
 * understand for Electron on CSS insertion.
 *
 * **Experimental** – it is unknown if that would work properly for all themes.
 */
async function parseImports(cssString: string, importCalls: string[], maxTries=5):Promise<string> {
  const anyImport = /^@import .+?$/gm;
  if(!anyImport.test(cssString)) return cssString;
  const promises:Promise<unknown>[] = [];
  cssString.match(anyImport)?.forEach(singleImport => {
    const matches = /^@import (?:(?:url\()?["']?([^"';)]*)["']?)\)?;?/m.exec(singleImport);
    if(matches?.[0] === undefined || matches[1] === undefined) return;
    const uri = resolveUrl(importCalls.at(-1) ?? "", matches[1]);
    if(importCalls.includes(uri)) {
      promises.push(Promise.reject(new Error("Circular reference in CSS imports are disallowed: " + uri)));
      return;
    }
    promises.push(fetchOrRead(new URL(uri))
      .then(file => file.download
        ? file.download.then(data => data.text())
        : file.read.then(data => data.toString()))
      .then(content => cssString = cssString.replace(singleImport, content))
      .then(() => importCalls.push(uri))
    );
  });
  const result = await Promise.allSettled(promises);
  const rejection = result.findIndex(({status})=> status === "rejected");
  if(rejection >= 0) {
    if(maxTries > 0) {
      console.warn("Couldn't resolve CSS theme imports, retrying...");
      return parseImports(cssString, importCalls, maxTries - 1);
    }
    else await promises[rejection];
  }
  if(anyImport.test(cssString)) {
    return parseImports(cssString, importCalls, maxTries);
  }
  return cssString;
}

async function encrypt(buffer:Buffer) {
  if((await safeStoragePromise).isEncryptionAvailable())
    return (await safeStoragePromise).encryptString(buffer.toString());
  return buffer.toString();
}

async function decrypt(string:Buffer|Promise<Buffer>) {
  if(!(await safeStoragePromise).isEncryptionAvailable() && !app.isReady() && process.platform !== "darwin")
    await app.whenReady();
  if(!(await safeStoragePromise).isEncryptionAvailable())
    return (await string).toString();
  try {
    return (await safeStoragePromise).decryptString(await string);
  } catch(cause) {
    if (!(await string).toString("utf-8").includes("�"))
      throw new Error("One of loaded styles is not trusted and could not be loaded.", {cause});
    else throw cause;
  }
}

async function addStyle(window?:Electron.BrowserWindow) {
  const options = {
    title: "Select a Discord theme to add to WebCord",
    properties: ["multiSelections", "openFile"],
    filters: [
      { name: "CSS stylesheet theme", extensions: ["theme.css"] }
    ]
  } satisfies Electron.OpenDialogOptions;
  const result = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options);
  if(result.canceled)
    return;
  const promises:Promise<unknown>[] = [];
  for (const path of result.filePaths) {
    const data = readFile(path).then(buf => encrypt(buf));
    const out = resolveFs(app.getPath("userData"),"Themes", basename(path, ".css"));
    if(resolveFs(path) === out) return;
    promises.push(data.then(buf => writeFile(out, buf)));
  }
  await Promise.all(promises);
}

/**
 * Loads CSS styles from `${userdata}/Themes` directory and observes their changes.
 *
 * Loaded themes are encrypted with {@link safeStorage.encryptString} whenever
 * Electron decides that encryption is available.
 */
async function loadStyles(webContents:Electron.WebContents) {
  const stylesDir = resolveFs(app.getPath("userData"),"Themes");
  await mkdir(stylesDir, {recursive:true});
  async function callback() {
    // Read CSS module directories.
    const promises:Promise<[string,Buffer]>[] = [];
    for (const path of await readdir(stylesDir)) {
      const index = resolveFs(stylesDir,path);
      if (!path.endsWith(".theme.css") && statSync(index).isFile())
        promises.push(readFile(index).then(buff=>[index,buff]));
    }
    const themeIDs:Promise<string>[] = [];
    for (const promise of promises)
      themeIDs.push(
        decrypt(promise.then(result => result[1]))
          .then(async data => parseImports(data,[(await promise)[0]]))
          /* Makes all CSS variables and color / background properties
            * `!important` (this should fix most styles).
            */
          .then(data => data.replaceAll(/((?:--|color|background)[^:;{]*:(?![^:]*?!important)[^:;]*)(;|})/g, "$1 !important$2"))
          .then(data => webContents.insertCSS(data))
      );
    return Promise.all(themeIDs);
  }
  watch(stylesDir).once("change", () => {
    webContents.reload();
  });
  callback().catch(commonCatches.print);
}

/**
 * Loads **unpacked** Chromium extensions from `{userData}/Extensions/Chromium`.
 *
 * Due to limitations of Electron, there's no full support to whole API of
 * Chromium extensions and there's likely no support at all to `v3` manifest
 * based extensions. See [*Chrome Extension Support*][chrome-ext] for more
 * details what should work and what might not have been implemented yet.
 *
 * [chrome-ext]: https://www.electronjs.org/docs/latest/api/extensions "Electron API documentation"
 */
export async function loadChromiumExtensions(session:Electron.Session) {
  const
    extDir = resolveFs(app.getPath("userData"),"Extensions", "Chrome"),
    promises = [];
  await mkdir(extDir, { recursive:true });
  for(const path of await readdir(extDir, {withFileTypes: true}))
    if (path.isDirectory() && session.isPersistent())
      promises.push(session.extensions.loadExtension(resolveFs(extDir, path.name)));
  return Promise.all(promises);
}

export const styles = Object.freeze({
  load: loadStyles,
  add: addStyle
});