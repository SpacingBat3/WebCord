/*
 * Electron Forge Config (configForge.js)
 */

// Let's import some keys from the package.json:

import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, rm } from "node:fs/promises";
import { FuseVersion, FuseV1Options } from "@electron/fuses";
import type { ForgeConfig } from "@electron-forge/shared-types";

import { Person, PackageJSON } from "../common/modules/package.js";
import type { BuildInfo } from "../common/global.js";

// Makers

import { MakerDeb }      from "@electron-forge/maker-deb";
import { MakerSnap }     from "@electron-forge/maker-snap";
import { MakerFlatpak }  from "@electron-forge/maker-flatpak";
import { MakerRpm }      from "@electron-forge/maker-rpm";
import { MakerZIP }      from "@electron-forge/maker-zip";
import { MakerAppImage } from "@reforged/maker-appimage";
import { MakerDMG }      from "@electron-forge/maker-dmg";
import { MakerWix }      from "@electron-forge/maker-wix";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";

// Publishers

import { PublisherGithub } from "@electron-forge/publisher-github";

// Plugins

import { FusesPlugin } from "@electron-forge/plugin-fuses";

// Constrains

const packageJson = new PackageJSON(["author","version","name"]);
const projectPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const appUserModelId = process.env["WEBCORD_WIN32_APPID"];
const flatpakId = process.env["WEBCORD_FLATPAK_ID"]?.toLowerCase() ??
  "io.github.spacingbat3.webcord";
const author = packageJson.data.author !== undefined ? new Person(packageJson.data.author).name : "SpacingBat3";

// Global variables in the config:
const iconFile = "sources/assets/icons/app";
const desktopGeneric = "Internet Messenger";
const desktopCategories = (["Network", "InstantMessaging"] as unknown as ["Network"]);

// Some custom functions

async function getCommit():Promise<string | null> {
  const headPath = resolve(projectPath, ".git/HEAD");
  if(!existsSync(headPath))
    return null;
  const refsPath = (await readFile(headPath))
    .toString()
    .split(": ")[1]
    ?.trim();
  if(refsPath !== undefined)
    return (await readFile(resolve(projectPath, ".git", refsPath)))
      .toString()
      .trim();
  return null;
}

const env = {
  asar: process.env["WEBCORD_ASAR"]?.toLowerCase() !== "false",
  build: process.env["WEBCORD_BUILD"]?.toLowerCase()
};

function getBuildID() {
  switch(env.build) {
    case "release":
    case "stable":
      return "release";
    default:
      return "devel";
  }
}

const config:ForgeConfig = {
  buildIdentifier: getBuildID,
  rebuildConfig: {
    disablePreGypCopy: true,
    onlyModules: []
  },
  packagerConfig: {
    executableName: packageJson.data.name, // name instead of the productName
    asar: env.asar,
    icon: iconFile, // used in Windows and MacOS binaries
    extraResource: [
      "LICENSE"
    ],
    quiet: true,
    ignore: [
      /*********** Directories: **********/
      /app\/(?:.*\/)?build\/?$/,
      /cache\/?$/,
      /out\/?$/,
      /schemas\/?$/,
      /************** Files: *************/
      /\.eslintrc\.json$/,
      /tsconfig\.json$/,
      /sources\/code\/?$/,
      /sources\/assets\/icons\/app\.icns$/,
      /********** Hidden files: **********/
      /^\.[a-z]+$/,
      /.*\/\.[a-z]+$/
    ],
    usageDescription: {
      Microphone: "This lets this app to internally manage the microphone access.",
      Camera: "This lets this app to internally manage the camera access."
    },
    osxUniversal: {
      mergeASARs: true
    },
    osxSign: true
  },
  makers: [
    /* === STABLE MAKERS: === */
    new MakerZIP({}, ["win32"] satisfies NodeJS.Platform[]),
    // Finally, some kind of installer in the configuration for Windows!
    new MakerSquirrel((arch) => ({
      setupIcon: `${iconFile}.ico`,
      setupExe: `${packageJson.data.name}-squirrel-${arch}.exe`,
      setupMsi: `${packageJson.data.name}-squirrel-${arch}.msi`,
      noMsi: false,
      // I have no clue what it does, but I'm gonna risk it.
      fixUpPaths: true,
      iconUrl: `https://raw.githubusercontent.com/SpacingBat3/WebCord/${packageJson.data.version}/${iconFile}.ico`,
      noDelta: true
    })),
    new MakerDMG({ icon: `${iconFile}.icns`, debug: getBuildID() === "devel" }),
    new MakerAppImage({ options: {
      icon: `${iconFile}.png`,
      genericName: desktopGeneric,
      categories: desktopCategories,
      flagsFile: true,
      type2runtime: true
    }}),
    new MakerDeb({ options: {
      icon: `${iconFile}.png`,
      section: "web",
      genericName: desktopGeneric,
      categories: desktopCategories
    }}),
    new MakerRpm({ options: {
      icon: `${iconFile}.png`,
      genericName: desktopGeneric,
      categories: desktopCategories,
      license: "MIT",
      compressionLevel: 9
    }}),
    ...(process.env["WEBCORD_ALL_MAKERS"]?.toLowerCase() === "true" ? [
      new MakerWix({
        appUserModelId: appUserModelId ?? author+".WebCord",
        ui: { chooseDirectory: true, },
        features: {
          autoUpdate: false,
          autoLaunch: {
            arguments: ["--start-minimized"],
            enabled: true
          }
        },
        name: "WebCord",
        manufacturer: author,
        icon: `${iconFile}.ico`,
        language: 0x0400,
        version: `v${packageJson.data.version}${getBuildID() === "devel" ? "-dev" : ""}`,
        shortName: "WebCord",
        programFilesFolderName: "WebCord",
        shortcutFolderName: "WebCord"
      }),
      /*
      * Since `maker-flatpak` is still silently failing, giving at normal
      * circumstances an inadequate information about the error itself (only useless
      * exit code), it is why I have it disabled by the default. Simply, I don't want
      * to cause a confusion just because someone has not added a flathub repository
      * for their user-wide Flathub environment.
      */
      new MakerFlatpak({ options: {
        id: flatpakId,
        genericName: desktopGeneric,
        categories: desktopCategories,
        runtimeVersion: "21.08",
        baseVersion: "21.08",
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
        modules: [
          {
            name: "zypak",
            sources: [
              {
                type: "git",
                url: "https://github.com/refi64/zypak",
                tag: "v2022.04"
              }
            ]
          }
        ],
        icon: `${iconFile}.png`
      }}),
      /* Snap maker still seems to fail for me, not sure why through... */
      new MakerSnap({
        features: {
          audio: true,
          passwords: true,
          webgl: true
        },
        grade: (getBuildID() === "release" ? "stable" : "devel"),
        confinement: (getBuildID() === "release" ? "strict" : "devmode")
      })
    ] : [])
  ],
  publishers: [
    new PublisherGithub({
      prerelease: getBuildID() === "devel",
      repository: {
        owner: author,
        name: "WebCord"
      },
      draft: false
    })
  ],
  plugins: [
    // Hardened Electron binary via Electron Fuses feature.
    new FusesPlugin({
      version: FuseVersion.V1,
      // Limit to macOS, since DMG cannot be built elsewhere right now.
      resetAdHocDarwinSignature: process.platform === "darwin",
      [FuseV1Options.OnlyLoadAppFromAsar]: env.asar,
      [FuseV1Options.RunAsNode]: getBuildID() === "devel",
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: getBuildID() === "devel",
      [FuseV1Options.EnableNodeCliInspectArguments]: getBuildID() === "devel",
      [FuseV1Options.EnableCookieEncryption]: true
    })
  ],
  hooks: {
    packageAfterCopy: async (_forgeConfig, path, _electronVersion, platform) => {
      /** Generates `buildInfo.json` file and saves it somewhere. */
      async function writeBuildInfo() {
        const buildConfig: BuildInfo = {
          ...(platform === "win32" && appUserModelId !== undefined ? { AppUserModelId: appUserModelId } : {}),
          type: getBuildID(),
          commit: getBuildID() === "devel" ? (await getCommit())??undefined : undefined,
          features: {
            updateNotifications: process.env["WEBCORD_UPDATE_NOTIFICATIONS"] !== "false"
          }
        };
        await writeFile(resolve(path, "buildInfo.json"), JSON.stringify(buildConfig, null, 2));
      }
      /** Removes data that is useless for specific platforms */
      async function removeUselessPlatformData() {
        const ext = platform === "win32" ? ".png" : ".ico";
        const icon = resolve(path, iconFile+ext);
        if(existsSync(icon))
          await rm(icon);
      }
      return Promise.all([
        writeBuildInfo(),
        removeUselessPlatformData()
      ]).then(() => void 0);
    }
  }
};

/* eslint-disable-next-line import/no-unused-modules *//* Module entry point */
export default config;