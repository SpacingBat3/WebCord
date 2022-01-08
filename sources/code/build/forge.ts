/*
 * Electron Forge Config (configForge.js)
 */

// Let's import some keys from the package.json:

import { buildInfo } from '../global/global';
import packageJson from '../global/modules/package';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path'
import { ForgeConfigFile } from './forge.d';

const projectPath = resolve(__dirname, '../../..')

// Global variables in the config:
const iconFile = "sources/assets/icons/app";
const desktopGeneric = "Internet Messenger";
const desktopCategories = (["Network", "InstantMessaging"] as unknown as ["Network"]);

// Some custom functions

function getCommit():string | undefined {
  const refsPath = readFileSync(resolve(projectPath, '.git/HEAD'))
    .toString()
    .split(': ')[1]
    ?.trim();
  if(refsPath) return readFileSync(resolve(projectPath, '.git', refsPath)).toString().trim();
}

function getBuildID() {
  switch(process.env.WEBCORD_BUILD?.toLocaleLowerCase()) {
    case "release":
    case "stable":
      return "release";
    default:
      return "devel";
  }
}

const config: ForgeConfigFile = {
  buildIdentifier: getBuildID,
  packagerConfig: {
    executableName: packageJson.data.name, // name instead of the productName
    asar: process.env.WEBCORD_ASAR !== "false",
    icon: iconFile, // used in Windows and MacOS binaries
    extraResource: [
      "LICENSE"
    ],
    quiet: true,
    ignore: [
      // Directories:
      /sources\/app\/.build/,
      /out\//,
      // Files:
      /\.eslintrc\.json$/,
      /tsconfig\.json$/,
      /sources\/app\/forge\/config\..*/,
      /sources\/code\/.*/,
      /sources\/assets\/icons\/app\.ic(?:o|ns)$/,
      // Hidden (for *nix OSes) files:
      /^\.[a-z]+$/,
      /.*\/\.[a-z]+$/
    ]
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32"]
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        icon: iconFile + ".icns",
        debug: getBuildID() === "devel"
      }
    },
    {
      name: "electron-forge-maker-appimage",
      config: {
        options: {
          icon: iconFile + ".png",
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
          icon: iconFile + ".png",
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
          icon: iconFile + ".png",
          genericName: desktopGeneric,
          categories: desktopCategories
        }
      }
    },
    /* Snaps are disabled until maker will be fixed to work without the
       multipass.
    {
      name: "@electron-forge/maker-snap",
      config: {
        features: {
          audio: true,
          browserSandbox: true
        },
        grade: (getBuildID() === "release" ? "stable" : "devel"),
      }
    },
    */
    /*{
      name: "@electron-forge/maker-flatpak",
      config: {
        options: {
          files: [
            [
              projectPath+"/docs",
              "/share/docs/"+packageJson.data.name
            ],
            [
              projectPath+"/LICENSE",
              "/share/licenses/"+packageJson.data.name+"/LICENSE.txt"
            ]
          ],
          icon: iconFile + ".png"
        }
      }
    }*/
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        prerelease: getBuildID() === "devel",
        repository: {
          owner: packageJson.data.author?.name ?? "SpacingBat3",
          name: "WebCord"
        },
        draft: getBuildID() === "release"
      }
    }
  ],
  hooks: {
    packageAfterCopy: async (_ForgeConfig, path:string) => {
      const buildConfig: buildInfo = {
        type: getBuildID(),
        commit: getBuildID() === "devel" ? getCommit() : undefined,
        features: {
          updateNotifications: process.env.WEBCORD_UPDATE_NOTIFICATIONS !== "false"
        }
      }
      writeFileSync(resolve(path, 'buildInfo.json'), JSON.stringify(buildConfig, null, 2))
    }
  }
};
module.exports = config;