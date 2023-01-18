import { app, desktopCapturer } from "electron/main";
import { nativeImage } from "electron/common";

import { lt } from "semver"

/**
 * **Workaround [#236](https://github.com/SpacingBat3/WebCord/issues/236)**:
 * WebCord calls appear as players in playerctl.
 */
export function disableMediaSessionService() {
  if(process.platform !== "win32" && process.platform !== "darwin") {
    const enabledFeatures = app.commandLine.getSwitchValue("enable-features");
    ["MediaSessionService","HardwareMediaKeyHandling"].forEach((feature) => {
      if(!enabledFeatures.includes(feature)) {
        const disabledFeatures = app.commandLine.getSwitchValue("disable-features");
        console.debug("[FEATURE] Disabling '%s'...",feature);
        if(disabledFeatures === "")
          app.commandLine.appendSwitch("disable-features",feature);
        else
          app.commandLine.appendSwitch("disable-features",disabledFeatures+","+feature);
      }
    });
  }
}

/**
 * **Workaround [#328](https://github.com/SpacingBat3/WebCord/issues/328)**:
 * Segfault on `desktopCapturer.getSources()` since Electron `22.x.y`.
 */
export function waylandCapturerPortal(waylandSession:boolean) {
  return !waylandSession || lt(process.versions.electron,"22.0.0") ?
  // Use desktop capturer on Electron 21 downwards or X11 systems
  desktopCapturer.getSources({
    types: waylandSession ? ["screen"] : ["screen", "window"],
    fetchWindowIcons: !waylandSession
  // Use hard-coded source for (X)Wayland since Electron 22.
  }) : Promise.resolve([{
    id: "screen:1:0",
    appIcon: nativeImage.createEmpty(),
    display_id: "",
    name: "Entire Screen",
    thumbnail: nativeImage.createEmpty()
  } satisfies Electron.DesktopCapturerSource]);
}

/**
 * **Workaround [#]**: Unable to paste images from Gecko-based browsers.
 * 
 * @process main
 */
export function prepareClipboardWorkaround() {

}

/**
 * **Workaround [electron/electron#31424](https://github.com/electron/electron/issues/31424)**:
 * BrowserView boundaries are not visible.
 */
export function attachBrowserView(window:Electron.BrowserWindow,view: Electron.BrowserView, bounds: Electron.Rectangle) {
  view.setBounds(bounds);
  setImmediate(() => window.addBrowserView(view));
}

