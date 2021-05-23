/*
 * Electron Forge Config (configForge.js)
 */

// Let's import some keys from the package.json:

import { packageJson } from './global';

// Global variables in the config:
const iconFile="icons/app"
const desktopGeneric = "Internet Messenger"
const desktopCategories = ["Network","InstantMessaging"]

module.exports = {
  packagerConfig: {
    executableName: packageJson.name, // name instead of the productName
    asar: true,
    icon: iconFile, // used in Windows and MacOS binaries
    extraResource: [
      "LICENSE",
      iconFile+".png"
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
      name: "@electron-forge/maker-zip",
      platforms: [
        "win32",
        "darwin"
      ]
    },
    {
      name: "electron-forge-maker-appimage",
      config: {
        options: {
          icon: iconFile+".png",
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
          icon: iconFile+".png",
          section: "web",
          genericName: desktopGeneric,
          categories: desktopCategories
        }
      }
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          icon: iconFile+".png",
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
          name: "WebCord"
        },
        draft: true
      }
    }
  ]
}