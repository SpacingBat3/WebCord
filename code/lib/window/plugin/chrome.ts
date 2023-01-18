import { handler } from "#cjs:/lib/exception";

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
        .catch(handler.print);
  }).catch(handler.print);
}