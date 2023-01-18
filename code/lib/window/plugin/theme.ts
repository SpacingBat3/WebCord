const safeStoragePromise = (import("electron/main"))
  .then(main => main.safeStorage);

async function fetchOrRead(file:string, signal?:AbortSignal) {
  const [
    readFile,
    fetchPolyfill
  ] = [
    import("fs/promises").then(fs => fs.readFile),
    import("electron-fetch").then(fetch => fetch.default.default)
  ];
  const url = new URL(file);
  if(url.protocol === "file:")
    return { read: (await readFile)(url.pathname, {signal}) };
  else if((global.fetch as typeof global.fetch|undefined) !== undefined)
    return { download: fetch(url.href, signal ? {signal} : {})};
  else
    return { download: (await fetchPolyfill)(url.href, signal ? {signal} : {})};
}

const importClassifiers = Object.freeze({
  any: /^@import .+?$/gm,
  url: /^@import (?:(?:url\()?["']?([^"';)]*)["']?)\)?;?/m
});

/**
 * A function that recursively parses `@import` CSS statements, so they can be
 * understand for Electron on CSS instertion.
 * 
 * **Experimental** – it is unknown if that would work properly for all themes.
 */
async function parseImports(cssString: string, maxTries=5, skipTests = false):Promise<string> {
  if(!skipTests && !importClassifiers.any.test(cssString)) return cssString;
  const promises:Promise<string>[] = cssString.match(importClassifiers.any)
    ?.flatMap(singleImport => {
      const matches = importClassifiers.url.exec(singleImport);
      if(matches?.[0] === undefined || matches[1] === undefined)
        return [];
      return fetchOrRead(matches[1])
        .then(data => {
          if(data.download)
            return data.download.then(data => data.text());
          else
            return data.read.then(data => data.toString());
        })
        .then(content => cssString = cssString.replace(singleImport, content));
  }) ?? [];
  try {
    await Promise.all(promises);
  } catch(error) {
    if(maxTries > 0) {
      console.warn("Couldn't resolve CSS theme imports, retrying again...");
      maxTries--;
    }
    else if(error instanceof Error)
      throw error;
    else
      throw new Error("Couldn't resolve CSS theme imports, aborting...");
  }
  if(importClassifiers.any.test(cssString)) {
    return parseImports(cssString, maxTries, true);
  }
  return cssString;
}

export async function add() {
  const [
    { app, dialog },
    { readFile, writeFile },
    { resolve, basename },
    { createHash },
    safeStorage
  ] = await Promise.all([
    import("electron/main"),
    import("fs/promises"),
    import("path"),
    import("crypto"),
    safeStoragePromise
  ]);
  function optionalCrypt(buffer:Buffer) {
    if(safeStorage.isEncryptionAvailable())
      return safeStorage.encryptString(buffer.toString());
    return buffer.toString();
  }
  const response = await dialog.showOpenDialog({
    title: "Import '*.theme.css'",
    message: "Not all stylesheets might be functional, but most BetterDiscord ones should be OK.",
    filters: [
      { name: "CSS stylesheet", extensions: ["css"] }
    ],
    properties: [ "dontAddToRecent", "multiSelections", "openFile" ],
  } satisfies Electron.OpenDialogOptions);
  await Promise.all(response.filePaths.map(async path => {
    const hash = createHash("sha1").update(path);
    const data = await readFile(path).then(data => optionalCrypt(data));
    const out = resolve(app.getPath("userData"),"Themes", basename(hash.digest("hex"), ".theme.css"));
    return await writeFile(data,out);
  }));
}

/**
 * Loads CSS styles from `${userdata}/Themes` directory and observes their changes.
 * 
 * Loaded themes are encrypted with {@link safeStorage.encryptString} whenever
 * Electron decides that encryption is available.
 */
export async function load(webContents:Electron.WebContents) {
  const [
    { app },
    { readFile, readdir, mkdir, stat },
    { watch, existsSync },
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
  if(!existsSync(stylesDir)) await mkdir(stylesDir, {recursive:true});
  watch(stylesDir).once("change", () => {
    webContents.reload();
  });
  return readdir(stylesDir)
    // Resolve to basename/absolute path pair.
    .then(paths => paths.map(path => Object.freeze([path,resolve(stylesDir,path)] as const)))
    // Filter out paths which aren't files without extension.
    .then(paths => paths.filter(async path => !path[0].includes(".") && (await stat(path[1])).isFile()))
    // Map file paths to content of these files.
    .then(paths => Promise.all(paths.map(path => readFile(resolve(stylesDir,path[1])))))
    // Insert CSS into the web page, patch some stuff for compatibility reasons.
    .then(dataArray => {
      const decrypt = async (string:Buffer) => {
        if(!safeStorage.isEncryptionAvailable() && !app.isReady())
          await app.whenReady();
        if(!safeStorage.isEncryptionAvailable())
          return string.toString();
        if(!string.toString("utf-8").includes("�"))
          throw new Error("One of loaded styles was not encrypted and could not be loaded.");
        return safeStorage.decryptString(string);
      };
      return dataArray.map(data => decrypt(data)
        .then(data => parseImports(data))
        /* Makes all CSS variables and color / background properties
         * `!important` (this should fix most styles).
         */
        .then(data => data.replaceAll(/((?:--|color|background)[^:;{]*:(?![^:]*?!important)[^:;]*)(;|})/g, "$1 !important$2"))
        .then(data => webContents.insertCSS(data))
      );
    });
}