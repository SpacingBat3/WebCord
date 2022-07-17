import { commonCatches } from "./error";

async function fetchOrRead(file:string, signal?:AbortSignal) {
  const [
    { readFile },
    fetch
  ] = await Promise.all([
    import("fs/promises"),
    import("electron-fetch").then(fetch => fetch.default)
  ]);

  const url = new URL(file);
  if(url.protocol === "file:")
    return { read: readFile(url.pathname, {signal}) };
  else
    return { download: fetch(url.href, (signal ? {signal} : {})) };
}

/**
 * A function that recursively patses `@import` CSS statements, so they can be
 * understand for Electron on CSS instertion.
 * 
 * **Experimental** – it is unknown if that would work properly for all themes.
 */
async function parseImports(cssString: string):Promise<string> {
  const anyImport = /^@import .+?$/gm;
  if(!anyImport.test(cssString)) return cssString;
  const promises:Promise<string>[] = [];
  for (const singleImport of cssString.match(anyImport)??[]) {
    const matches = singleImport.match(/^@import (?:(?:url\()?["']?([^"';)]*)["']?)\)?;?/m);
    if(matches === null || matches.length < 2) break;
    const file = matches[1] as string;
    promises.push(fetchOrRead(file)
      .then(data => {
        if (data.download)
          return data.download.then(data => data.text());
        else
          return data.read.then(data => data.toString());
      })
      .then(content => cssString = cssString.replace(singleImport, content))
    );
  }
  await Promise.allSettled(promises);
  if(anyImport.test(cssString)) {
    return parseImports(cssString);
  }
  return cssString;
}

/**
 * Loads CSS styles from `${userdata}/Themes` directory and observes their changes.
 * 
 * On Windows and MacOS, entire directory is watched recursively for changes, so
 * new themes will apply immediatelly after they're updated. On other platforms,
 * only the existing files are watched for changes and manual restart is
 * required for 
 */
export async function loadStyles(webContents:Electron.WebContents) {
  const [
    { app },
    { readFile, readdir },
    { watch, existsSync, mkdirSync, statSync },
    { resolve }
  ] = await Promise.all([
    import("electron/main"),
    import("fs/promises"),
    import("fs"),
    import("path")
  ]);
  const stylesDir = resolve(app.getPath("userData"),"Themes");
  if(!existsSync(stylesDir)) mkdirSync(stylesDir, {recursive:true});
  const callback = () => new Promise<Promise<string>[]>((callback, reject) => {
    // Read CSS module directories.
    readdir(stylesDir)
      .then(paths => {
        const promises:Promise<Buffer>[] = [];
        for(const path of paths) {
          const index = resolve(stylesDir,path);
          if (/^.+\.theme\.css$/.test(path) && statSync(index).isFile()) {
            promises.push(readFile(index));
            if(process.platform !== "win32" && process.platform !== "darwin") {
              const fsWatch = watch(index);
              fsWatch.once("change", () => {
                webContents.reload();
              });
              webContents.once("did-finish-load", () => fsWatch.close());
            }
          }
        }
        Promise.all(promises).then(dataArray => {
          const themeIDs:Promise<string>[] = [];
          for(const data of dataArray)
            themeIDs.push(
              parseImports(data.toString())
                /* Makes all CSS variables and color / background properties
                 * `!important` (this should fix most styles).
                 */
                .then(data => data.replaceAll(/((?:--|color|background)[^:;{]*:(?![^:]*?!important)[^:;]*)(;|})/g, "$1 !important$2"))
                .then(data => webContents.insertCSS(data))
            );
          callback(themeIDs);
        }).catch(reason => reject(reason));
      }).catch(reason => reject(reason));
  });
  if(process.platform === "win32" || process.platform === "darwin")
    watch(stylesDir, {recursive:true}).once("change", () => {
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