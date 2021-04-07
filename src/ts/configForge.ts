/*
 * Electron Forge Config (configForge.js)
 */

// Let's import some keys from the package.json:

/* eslint-disable */
const packageJson = require("../../package.json");

// Global variables in the config:
let iconFile:string;
switch (process.platform) {
  case 'win32':
    iconFile="icons/app.ico"
  break;
  case 'darwin':
    iconFile="icons/app.icns"
  break;
  default:
    iconFile="icons/app.png"
}
const desktopName = packageJson.productName
const desktopGeneric = "Internet Messenger"
const desktopCategories = ["Network","InstantMessaging"]

module.exports = {
  packagerConfig: {
    executableName: packageJson.name, // name instead of the productName
    asar: true,
    icon: iconFile, // used in Windows and MacOS binaries
    extraResource: [
      "docs/COPYING",
      iconFile
    ],
    quiet: true,
    ignore:[
      "docs",
      "build",
      "extra",
      "src/js/configForge.js",
      "src/ts/configForge.ts",
      "icons/app.*"
    ]
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "electron_discord_webapp"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: [
        "darwin"
      ]
    },
    {
      name: "electron-forge-maker-appimage",
      config: {
        options: {
          icon: iconFile,
          productName: desktopName,
          genericName: desktopGeneric,
          categories: desktopCategories,
          compression: "gzip" // "xz" is too slow for the Electron AppImages
        }
      }
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: iconFile,
          section: "web",
          productName: desktopName,
          genericName: desktopGeneric,
          categories: desktopCategories
        }
      }
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          icon: iconFile,
          productName: desktopName,
          genericName: desktopGeneric,
          categories: desktopCategories
        }
      }
    }
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: packageJson.author.name,
          name: "electron-discord-webapp"
        },
        draft: true
      }
    }
  ]
}