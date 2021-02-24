/*
 * Electron Forge Config (configForge.js)
 */

// Let's import some keys from the package.json:
const packageJson = require(`../../package.json`);
// Global variables in the config:
const iconFile = "icons/app.png"

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
      "build"
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
        icon: iconFile
      }
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: iconFile,
          section: "web",
          categories: ["Network"]
        }
      }
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          icon: iconFile
        }
      }
    }
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        prerelease: true
      }
    }
  ]
}
