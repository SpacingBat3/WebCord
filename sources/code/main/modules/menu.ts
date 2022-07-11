/*
 * menus – OS native menus (tray menu, context menu, menu bar etc.)
 */
import { app, Menu, Tray } from "electron/main";
import { shell, clipboard, nativeImage } from "electron/common";

import {
  getBuildInfo,
  appInfo
} from "../../common/modules/client";

import { AppConfig } from "./config";

const appConfig = new AppConfig();

import { EventEmitter } from "events";
import { createGithubIssue } from "./bug";
import l10n from "../../common/modules/l10n";
import loadSettingsWindow from "../windows/settings";
import loadDocsWindow from "../windows/docs";
import showAboutPanel from "../windows/about";
import { commonCatches } from "./error";

const sideBar = new EventEmitter();
const devel = getBuildInfo().type === "devel";

sideBar.on("hide", (contents: Electron.WebContents) => {
  console.debug("[EVENT] Hiding menu bar...");
  contents.insertCSS("div[class|=sidebar]{ width: 0px !important; }").then(cssKey => {
    sideBar.once("show", () => {
      console.debug("[EVENT] Showing menu bar...");
      contents.removeInsertedCSS(cssKey).catch(commonCatches.throw);
    });
  }).catch(commonCatches.print);
});

// Contex Menu with spell checker

export function context(parent: Electron.BrowserWindow): void {
  const strings = (new l10n()).client;
  parent.webContents.on("context-menu", (_event, params) => {
    const cmenu: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
      { type: "separator" },
      { label: strings.context.cut, role: "cut", enabled: params.editFlags.canCut },
      { label: strings.context.copy, role: "copy", enabled: params.editFlags.canCopy },
      {
        label: strings.context.paste,
        enabled: clipboard.availableFormats().length !== 0 && params.editFlags.canPaste,
        role: "paste"
      },
      { type: "separator" }
    ];
    let position = 0;
    for (const suggestion of params.dictionarySuggestions) {
      cmenu.splice(++position, 0, {
        label: suggestion,
        click: () => parent.webContents.replaceMisspelling(suggestion)
      });
    }
    if (params.misspelledWord) {
      cmenu.splice(++position, 0, { type: "separator" });
      cmenu.splice(++position, 0, {
        label: strings.context.dictionaryAdd,
        click: () => parent.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
      });
      cmenu.splice(++position, 0, { type: "separator" });
    }
    if (params.linkURL) {
      cmenu.push({
        label: strings.context.copyURL,
        click: () => clipboard.writeText(params.linkURL)
      });
      if (params.linkText) cmenu.push({
        label: strings.context.copyURLText,
        click: () => clipboard.writeText(params.linkText)
      });
      cmenu.push({ type: "separator" });
    }
    if (devel || appConfig.get().settings.advanced.devel.enabled) {
      cmenu.push({
        label: strings.context.inspectElement,
        click: () => parent.webContents.inspectElement(params.x, params.y)
      });
      cmenu.push({ type: "separator" });
    }
    Menu.buildFromTemplate(cmenu).popup({
      window: parent,
      x: params.x,
      y: params.y
    });
  });
}

// Tray menu

export function tray(parent: Electron.BrowserWindow): Electron.Tray {
  const strings = (new l10n()).client;
  let trayIcon = nativeImage.createFromPath(appInfo.trayIcon);
  // Resize icon on MacOS when its height is longer than 22 pixels.
  if(process.platform === "darwin" && trayIcon.getSize().height > 22)
    trayIcon = trayIcon.resize({height: 22});
  const tray = new Tray(trayIcon);
  function toogleVisibility() {
    if(parent.isVisible() && parent.isFocused()) {
      parent.hide();
    } else if (!parent.isVisible()) {
      parent.show();
    } else {
      parent.focus();
    }
  }
  const contextMenu = Menu.buildFromTemplate([
    {
      label: strings.windows.about,
      click: () => showAboutPanel(parent)
    },
    {
      label: strings.windows.docs,
      click: () => void loadDocsWindow(parent).catch(commonCatches.throw)
    },
    {
      label: strings.help.bugs,
      click: () => void createGithubIssue().catch(commonCatches.throw)
    },
    { type: "separator" },
    {
      label: strings.tray.toggle,
      click: toogleVisibility
    },
    {
      label: strings.tray.quit,
      click: function () {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip(app.getName());
  tray.on("click", toogleVisibility);
  // Exit to the tray
  {
    let willQuit = false;
    app.once("before-quit", () => willQuit = true);
    parent.on("close", (event) => {
      if (!willQuit) {
        event.preventDefault();
        parent.hide();
      }
    });
  }
  return tray;
}

// Menu Bar

export function bar(repoLink: string, parent: Electron.BrowserWindow): Electron.Menu {
  const strings = (new l10n()).client;
  const webLink = repoLink.substring(repoLink.indexOf("+") + 1);
  const menu = Menu.buildFromTemplate([
    // File
    {
      label: strings.menubar.file.groupName, submenu: [
        // Settings
        {
          label: strings.windows.settings,
          click: () => loadSettingsWindow(parent)
        },
        // Extensions (Work In Progress state)
        /*{
					label: strings.menubar.file.addon.groupName,
					visible: devel || appConfig.get().devel,
					//click: () => {}
				},*/
        { type: "separator" },
        // Reset
        {
          label: strings.menubar.file.relaunch,
          accelerator: "CmdOrCtrl+Alt+R",
          click: () => {
            const newArgs:string[] = [];
            for (const arg of process.argv) {
              if(!/^--?(?:start-minimized|m)$/.test(arg))
                newArgs.push(arg);
            }
            newArgs.shift();
            app.relaunch({
              args: newArgs,
            });
            app.quit();
          }
        },
        // Quit
        {
          label: strings.menubar.file.quit,
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    // Edit
    { role: "editMenu", label: strings.menubar.edit.groupName, submenu: [
      { label: strings.menubar.edit.undo, role: "undo" },
      { label: strings.menubar.edit.redo, role: "redo" },
      { type: "separator" },
      { label: strings.context.cut, role: "cut" },
      { label: strings.context.copy, role: "copy" },
      { label: strings.context.paste, role: "paste" }
    ]},
    // View
    {
      label: strings.menubar.view.groupName, submenu: [
        // Reload
        { label: strings.menubar.view.reload, role: "reload" },
        // Force reload
        { label: strings.menubar.view.forceReload, role: "forceReload" },
        { type: "separator" },
        // DevTools
        {
          label: strings.menubar.view.devTools,
          id: "devTools",
          role: "toggleDevTools",
          enabled: devel || appConfig.get().settings.advanced.devel.enabled
        },
        { type: "separator" },
        // Zoom settings (reset, zoom in, zoom out)
        { label: strings.menubar.view.resetZoom, role: "resetZoom" },
        { label: strings.menubar.view.zoomIn, role: "zoomIn" },
        { label: strings.menubar.view.zoomOut, role: "zoomOut" },
        { type: "separator" },
        // Toggle full screen
        { label: strings.menubar.view.fullScreen, role: "togglefullscreen" }
      ]
    },
    // Window
    {
      label: strings.menubar.window.groupName, submenu: [{
        label: strings.menubar.window.mobileMode,
        type: "checkbox",
        accelerator: "CmdOrCtrl+Alt+M",
        checked: false,
        click: () => {
          if ((sideBar.listenerCount("show") + sideBar.listenerCount("hide")) > 1) {
            sideBar.emit("show");
          } else {
            sideBar.emit("hide", parent.webContents);
          }
        }
      }]
    },
    // Help
    {
      label: strings.help.groupName, role: "help", submenu: [
        // About
        { label: strings.windows.about, click: () => showAboutPanel(parent)},
        // Repository
        { label: strings.help.repo, click: () => void shell.openExternal(webLink).catch(commonCatches.throw) },
        // Documentation
        { label: strings.windows.docs, click: () => void loadDocsWindow(parent).catch(commonCatches.throw) },
        // Report a bug
        { label: strings.help.bugs, click: () => void createGithubIssue().catch(commonCatches.throw) }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
  return menu;
}