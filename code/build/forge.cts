/*
 * Electron Forge Config (configForge.js)
 */

import { existsSync } from "fs";
import { readFile, writeFile, rm } from "fs/promises";
import { resolve } from "path";

import { Person, PackageJSON } from "#cjs:/lib/meta/package";
//@ts-expect-error: Type imports should be module-independant.
import type { BuildInfo } from "#esm:/lib/meta/build";

import type { ForgeConfigFile, ForgePlatform } from "#dts:forge";

import { flipFuses, FuseVersion, FuseV1Options } from "@electron/fuses";

const packageJson = new PackageJSON(["author","version","name"]);
const projectPath = resolve(__dirname, "../../..");
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

function getElectronPath(platform:ForgePlatform) {
  switch (platform) {
    case "darwin":
      return "Electron.app/Contents/MacOS/Electron";
    case "win32":
      return "electron.exe";
    default:
      return "electron";
  }
}

function getBuildID() {
  switch(env.build) {
    case "release":
    case "stable":
      return "release";
    default:
      return "devel";
  }
}

const config: ForgeConfigFile = {
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
      /tsconfig\.(?:base\.)?json$/,
      /source\/?$/,
      /assets\/icons\/app\.icns$/,
      /assets\/translations\/en\/?/,
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
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32"],
    },
    // Finally, some kind of installer in the configuration for Windows!
    { name: "@electron-forge/maker-squirrel" },
    {
      name: "@electron-forge/maker-wix",
      config: {
        appUserModelId: appUserModelId ?? author+".WebCord",
        ui: { chooseDirectory: true },
        features: {
          autoUpdate: false,
          autoLaunch: {
            arguments: ["--start-minimized"],
            enabled: true
          }
        },
        name: "WebCord",
        manufacturer: author,
        icon: iconFile+".ico",
        language: 0x0400,
        version: "v"+packageJson.data.version+(getBuildID() === "devel" ? "-dev" : ""),
        shortName: "WebCord",
        programFilesFolderName: "WebCord",
        shortcutFolderName: "WebCord"
      },
      enabled: process.env["WEBCORD_ALL_MAKERS"]?.toLowerCase() === "true"
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        icon: iconFile + ".icns",
        debug: getBuildID() === "devel"
      }
    },
    {
      name: "@reforged/maker-appimage",
      config: {
        options: {
          icon: iconFile + ".png",
          genericName: desktopGeneric,
          categories: desktopCategories
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
    /*
     * Since `maker-flatpak` is still silently failing, giving at normal
     * circumstances an inadequate information about the error itself (only useless
     * exit code), it is why I have it disabled by the default. Simply, I don't want
     * to cause a confusion just because someone has not added a flathub repository
     * for their user-wide Flathub environment.
     * 
     * It will stay as it is until either official maker will resolve this or my
     * own maker implementation will be mature enough to be released.
     */
    {
      name: "@electron-forge/maker-flatpak",
      config: {
        options: {
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
          icon: iconFile + ".png"
        }
      },
      enabled: process.env["WEBCORD_ALL_MAKERS"]?.toLowerCase() === "true"
    },
    /* Snap maker still seems to fail for me, not sure why through... */
    {
      name: "@electron-forge/maker-snap",
      config: {
        features: {
          audio: true,
          passwords: true,
          webgl: true
        },
        grade: (getBuildID() === "release" ? "stable" : "devel"),
        confinement: (getBuildID() === "release" ? "strict" : "devmode")
      },
      enabled: process.env["WEBCORD_ALL_MAKERS"]?.toLowerCase() === "true"
    }
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        prerelease: getBuildID() === "devel",
        repository: {
          owner: author,
          name: "WebCord"
        },
        draft: false
      }
    }
  ],
  hooks: {
    packageAfterCopy: async (_forgeConfig, path, _electronVersion, platform) => {
      /** Generates `buildInfo.json` file and saves it somewhe. */
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
      ]);
    },
    // Hardened Electron binary via Electron Fuses feature.
    packageAfterExtract: (_forgeConfig, path, _electronVersion, platform) =>
      flipFuses(resolve(path, getElectronPath(platform)), {
        version: FuseVersion.V1,
        resetAdHocDarwinSignature: platform === "darwin" && path.includes("arm64"),
        [FuseV1Options.OnlyLoadAppFromAsar]: env.asar,
        [FuseV1Options.RunAsNode]: getBuildID() === "devel",
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: getBuildID() === "devel",
        [FuseV1Options.EnableNodeCliInspectArguments]: getBuildID() === "devel"
      }),
    // Fix file names of Windows makers:
    postMake: (_forgeConfig, makeResults) => Promise.all(makeResults
      .map(async result => {
        // Ignore other platforms
        if(result.platform !== "win32")
          return result;
        // Import modules
        const p = await import("path"), fs = import("fs/promises");
        // Set list of new artifacts
        result.artifacts = await Promise.all(result.artifacts
          // Rename artifacts to include arch suffix.
          .map(async artifact => {
            const ext = p.extname(artifact);
            const basename = p.basename(artifact,ext);
            // Ignore artifacts that doesn't need to be fixed.
            if(basename.includes(result.arch))
              return artifact;
            const newArtifact = p.resolve(
              p.dirname(artifact), basename+"-"+result.arch+ext
            );
            await (await fs).rename(artifact,newArtifact);
            return newArtifact;
          })
        );
        return result;
      }))
  }
};

export default config;