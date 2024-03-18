import { resolve } from "url";
import { commonCatches } from "./error";

const safeStoragePromise = (import("electron/main"))
  .then(main => main.safeStorage);

async function fetchOrRead(url:URL, signal?:AbortSignal) {
  const readFile = import("fs/promises").then(fs => fs.readFile);

  if(url.protocol === "file:")
    return { read: (await readFile)(url.pathname, {signal}) };
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
    const file = resolve(importCalls.at(-1) ?? "", matches[1]);
    if(importCalls.includes(file)) {
      promises.push(Promise.reject(new Error("Circular reference in CSS imports are disallowed: " + file)));
      return;
    }
    promises.push(fetchOrRead(new URL(file))
      .then(data => {
        if (data.download)
          return data.download.then(data => data.text());
        else
          return data.read.then(data => data.toString());
      })
      .then(content => cssString = cssString.replace(singleImport, content))
      .then(() => importCalls.push(file))
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

async function addStyle(window?:Electron.BrowserWindow) {
  const [
    { app, dialog },
    { readFile, writeFile },
    { resolve, basename },
    safeStorage
  ] = await Promise.all([
    import("electron/main"),
    import("fs/promises"),
    import("path"),
    safeStoragePromise
  ]);
  function optionalCrypt(buffer:Buffer) {
    if(safeStorage.isEncryptionAvailable())
      return safeStorage.encryptString(buffer.toString());
    return buffer.toString();
  }
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
    const data = readFile(path).then(path => optionalCrypt(path));
    const out = resolve(app.getPath("userData"),"Themes", basename(path, ".css"));
    if(resolve(path) === out) return;
    promises.push(data.then(data => writeFile(out, data)));
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
  const [
    { app },
    { readFile, readdir },
    { watch, existsSync, mkdirSync, statSync },
    { resolve },
    safeStorage
  ] = await Promise.all([
    import("electron/main"),
    import("fs/promises"),
    import("fs"),
    import("path"),
    safeStoragePromise
  ]);
  const stylesDir = resolve(app.getPath("userData"),"Themes");
  if(!existsSync(stylesDir)) mkdirSync(stylesDir, {recursive:true});
  const callback = () => new Promise<Promise<string>[]>((callback, reject) => {
    // Read CSS module directories.
    readdir(stylesDir)
      .then(paths => {
        const promises:Promise<[string,Buffer]>[] = [];
        for(const path of paths) {
          const index = resolve(stylesDir,path);
          if (!path.endsWith(".theme.css") && statSync(index).isFile())
            promises.push(Promise.all([index,readFile(index)]));
        }
        Promise.all(promises).then(resArray => {
          const themeIDs:Promise<string>[] = [];
          const decrypt = async (string:Buffer) => {
            if(!safeStorage.isEncryptionAvailable() && !app.isReady() && process.platform !== "darwin")
              await app.whenReady();
            if(!safeStorage.isEncryptionAvailable())
              return string.toString();
            if(!string.toString("utf-8").includes("�"))
              throw new Error("One of loaded styles was not encrypted and could not be loaded.");
            return safeStorage.decryptString(string);
          };
          for(const res of resArray)
            themeIDs.push(
              decrypt(res[1])
                .then(data => parseImports(data,[res[0]]))
                /* Makes all CSS variables and color / background properties
                 * `!important` (this should fix most styles).
                 */
                .then(data => data.replaceAll(/((?:--|color|background)[^:;{]*:(?![^:]*?!important)[^:;]*)(;|})/g, "$1 !important$2"))
                .then(data => webContents.insertCSS(data))
            );
          callback(themeIDs);
        }).catch(reason => reject(reason as Error));
      }).catch(reason => reject(reason as Error));
  });
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
  const [
    { app },
    { readdir },
    { existsSync, mkdirSync },
    { resolve }
  ] = await Promise.all([
    import("electron/main"),
    import("fs/promises"),
    import("fs"),
    import("path")
  ]);
  const extDir = resolve(app.getPath("userData"),"Extensions", "Chrome");
  if(!existsSync(extDir)) {
    mkdirSync(extDir, {recursive:true});
    return;
  }
  readdir(extDir, {withFileTypes: true}).then(paths => {
    for (const path of paths) if (path.isDirectory() && session.isPersistent())
      session.loadExtension(resolve(extDir, path.name))
        .catch(commonCatches.print);
  }).catch(commonCatches.print);
}

export const styles = Object.freeze({
  load: loadStyles,
  add: addStyle
});