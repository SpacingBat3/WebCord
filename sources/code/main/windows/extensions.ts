import { commonCatches } from "../modules/error";

/**
 * Loads CSS styles from `${userdata}/styles` directory and observes their changes.
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
        { watch, existsSync, mkdirSync },
        { resolve }
     ] = await Promise.all([
         import("electron"),
         import("fs/promises"),
         import("fs"),
         import("path")
     ]);
    const stylesDir = resolve(app.getPath("userData"),"Themes")
    if(!existsSync(stylesDir)) mkdirSync(stylesDir, {recursive:true});
    const callback = () => new Promise<Promise<string>[]>((callback, reject) => {
        // Read CSS module directories.
        readdir(stylesDir)
            .then(paths => {
                // Read directories containing CSS files. 
                for(const directory of paths) readdir(resolve(stylesDir,directory))
                    .then(paths => {
                        const promises:Promise<Buffer>[] = [];
                        if(paths.includes("index.css")) {
                            const index = resolve(stylesDir,directory,"index.css")
                            promises.push(readFile(index));
                            if(process.platform !== "win32" && process.platform !== "darwin") {
                                const fsWatch = watch(index);
                                fsWatch.once("change", () => {
                                    webContents.reload();
                                })
                                webContents.once("did-finish-load", () => fsWatch.close());
                            }
                        }
                            
                        Promise.all(promises).then(dataArray => {
                            const themeIDs:Promise<string>[] = []
                            for(const data of dataArray)
                                themeIDs.push(webContents.insertCSS(data.toString(), {cssOrigin: 'user'}))
                            callback(themeIDs);
                        }).catch(reason => reject(reason));
                    })
                    .catch(reason => reject(reason))
            })
            .catch(reason => reject(reason))
    });
    if(process.platform === "win32" || process.platform === "darwin")
        watch(stylesDir, {recursive:true}).once("change", () => {
            webContents.reload();
        })
    callback().catch(commonCatches.print);
}