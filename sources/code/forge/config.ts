/*
 * Electron Forge Config (configForge.js)
 */

// Let's import some keys from the package.json:

import { packageJson } from '../global';
import { ForgeConfig, ForgePlatform } from '@electron-forge/shared-types';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path'

// Global variables in the config:
const iconFile = "sources/assets/icons/app";
const desktopGeneric = "Internet Messenger";
const desktopCategories = ["Network", "InstantMessaging"];

// Some custom functions

function getCommit():string {
  const projectPath = resolve(__dirname, '../../..')
  const refsPath = readFileSync(resolve(projectPath, '.git/HEAD'))
    .toString()
    .split(': ')[1]
    .trim();
  return readFileSync(resolve(projectPath, '.git', refsPath)).toString().trim();
}

/*function resourcesPath(path: string) {
  if(existsSync(resolve(path, 'Contents/Resources/')))
    return resolve(path, 'Contents/Resources/');
  else
    return resolve(path, 'resources/')
}*/

function getBuildID() {
  switch(process.env.WEBCORD_BUILD?.toLocaleLowerCase()) {
    case "release":
    case "stable":
      return "release"
    break;
    default:
      return "devel"
  }
}

type Redeclare<I, M> = Omit<I, keyof M> & M;

type ForgeConfigFile = Redeclare<ForgeConfig, {
  plugins?: ForgeConfig["plugins"];
  pluginInterface?: ForgeConfig["pluginInterface"];
  electronRebuildConfig?: ForgeConfig["electronRebuildConfig"];
  makers: ForgeConfig["makers"] | {
    name: string;
    platforms?: ForgePlatform[] | null;
    config?: Record<string, unknown>;
  }[];
}>;

const config: Partial<ForgeConfigFile> = {
  buildIdentifier: getBuildID,
  packagerConfig: {
    executableName: packageJson.name, // name instead of the productName
    asar: true,
    icon: iconFile, // used in Windows and MacOS binaries
    extraResource: [
      "LICENSE",
      iconFile + ".png"
    ],
    quiet: true,
    ignore: [
      /out/,
      /docs/,
      /build/,
      /extra/,
      /\.eslintrc\.json/,
      /tsconfig\.json/,
      /sources\/app\/forge\/config\..*/,
      /sources\/code\/.*/,
      /sources\/assets\/icons\/app\..*/,
      /^\.[a-z]+$/,
      /.*\/\.[a-z]+$/
    ]
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: [
        "win32",
        "darwin"
      ],
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
      platforms: [],
      config: {
        options: {
          icon: iconFile + ".png",
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
  ],
  hooks: {
    packageAfterCopy: async (_ForgeConfig, path) => {
      const buildConfig = {
        type: getBuildID(),
        commit: (getBuildID() === "devel") ? getCommit() : undefined,
      }
      writeFileSync(resolve(path, 'buildInfo.json'), JSON.stringify(buildConfig, null, 2))
    }
  }
};

module.exports = config;