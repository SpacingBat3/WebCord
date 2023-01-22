import { BrowserWindow, globalShortcut } from "electron/main";
import { commonCatches } from "./error";

export function registerShortcuts(window: BrowserWindow) {
  globalShortcut.register("Insert", () => {
    window.webContents.executeJavaScript(
      "document.querySelector('button[aria-label=\"Mute\"').click()"
    ).catch(commonCatches.print);
  });

  globalShortcut.register("F1", () => {
    window.webContents.executeJavaScript(
      "document.querySelector('button[aria-label=\"Deafen\"').click()"
    ).catch(commonCatches.print);
  });
}
