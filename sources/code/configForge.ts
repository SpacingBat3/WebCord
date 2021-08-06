/*
 * Electron Forge Config (configForge.js)
 */

// Let's import some keys from the package.json:

import { packageJson } from './global';
import { ForgeConfig, ForgePlatform } from '@electron-forge/shared-types';

// Global variables in the config:
const iconFile = "sources/assets/icons/app";
const desktopGeneric = "Internet Messenger";
const desktopCategories = ["Network", "InstantMessaging"];

type Redeclare<I, M> = Omit<I, keyof M> & M;

type ForgeConfigFile = Redeclare<ForgeConfig, {
  plugins?: ForgeConfig["plugins"];
  pluginInterface?: ForgeConfig["pluginInterface"];
  electronRebuildConfig?: ForgeConfig["electronRebuildConfig"];
  makers?: ForgeConfig["makers"] | {
    name: string;
    platforms?: ForgePlatform[] | null;
    config?: Record<string, unknown>;
  }[];
}>;

const config: ForgeConfigFile = {
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
      /docs/,
      /build/,
      /extra/,
      /sources\/app\/configForge\..*/,
      /sources\/code\/configForge\.ts/,
      /sources\/assets\/icons\/app\..*/
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
  ]
};

module.exports = config;