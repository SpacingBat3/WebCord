import net from "net";
import fs from "fs";
import keycode from "keycode";
import { app, ipcMain } from "electron/main";
import os from "os";

interface KeybindState {
  _state?: Record<string, {
    id: string;
    action: string;
    shortcut: [0, number, 4][];
    managed: boolean;
    context: string;
  }>;
}

export default function bindKeybindSocket(window: Electron.BrowserWindow) {
  const runtimeDirectory = process.env["XDG_RUNTIME_DIR"] ?? `/run/user/${os.userInfo().uid}`;
  const socketPath = `${runtimeDirectory}/webcord-keybinds.sock`;
  const socket = net.createServer((connection) => {
    console.log("[Keybinds] Received socket connection.");

    let payload: Buffer | null = null;

    connection.on("data", (dataPart: Buffer) => {
      console.debug("[Keybinds] Data received.", dataPart);
      payload = Buffer.concat(payload ? [payload, dataPart] : [dataPart]);
    });
    connection.on("end", () => {
      console.log("[Keybinds] Connection ended.");

      if (!payload) {
        console.error("[Keybinds] No data provided.");
        return;
      }
      if (payload.indexOf(Buffer.from([0x99, 0x00]), -3) === -1) {
        console.error("[Keybinds] Invalid payload provided.");
        return;
      }

      const action = payload.subarray(0, payload.indexOf(0x00)).toString();
      const remaining = payload.subarray(payload.indexOf(0x00) + 1);
      const state = remaining[0];

      const handler = (_event: Electron.IpcMainEvent, value: KeybindState) => {
        ipcMain.removeListener("keybinds-value", handler);
        if (!value._state) {
          console.error("[Keybinds] Could not get keybinds from Discord.");
          return;
        }
        const keybinds = Object.values(value._state);
        const handled = keybinds.some((keybind) => {
          const accelerator = keybind.shortcut.map((shortcut) => keycode(shortcut[1])).join("+");

          if (keybind.action === action) {
            window.webContents.sendInputEvent({
              type: state === 0x01 ? "keyDown" : "keyUp",
              keyCode: accelerator,
            });
            return true;
          }

          return false;
        });

        if (!handled) {
          console.error("[Keybinds] Undefined keybind. Make sure that you have defined a key for this action.");
        }
      };
      ipcMain.on("keybinds-value", handler);
      window.webContents.send("pull-keybinds");
    });

    connection.end();
  });
  socket.listen(socketPath, () => console.log(`[Keybinds] Socket opened at ${socketPath}.`));
  app.on("quit", () => { fs.unlinkSync(socketPath); });
}
