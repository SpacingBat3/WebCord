/*
 * This is a file containing all of the types declarations used to determine the
 * correct type for each property in config, as well as enable autocompletition
 * for some of the text editors supporting it.
 * 
 * I put it in separate file to make `forge.ts` mainly focused on Electron Forge
 * configuration.
 */

// Forge types

import type { ForgeConfig, ResolvedForgeConfig, ForgeHookMap } from "@electron-forge/shared-types";
import type { OfficialPlatform } from "electron-packager";
export type ForgePlatform = Exclude<OfficialPlatform | NodeJS.Platform, "android">;

// Maker config types

import type { MakerDebConfig }      from "@electron-forge/maker-deb";
import type { MakerSnapConfig }     from "@electron-forge/maker-snap";
import type { MakerFlatpakConfig }  from "@electron-forge/maker-flatpak";
import type { MakerRpmConfig }      from "@electron-forge/maker-rpm";
import type { MakerZIPConfig }      from "@electron-forge/maker-zip";
import type { MakerAppImageConfig } from "@reforged/maker-appimage";
import type { MakerDMGConfig }      from "@electron-forge/maker-dmg";
import type { MakerWixConfig }      from "@electron-forge/maker-wix";
import type { MakerSquirrelConfig } from "@electron-forge/maker-squirrel";

// Publisher config types

import { PublisherGitHubConfig } from "@electron-forge/publisher-github/dist/Config";

type Redeclare<I, M> = Omit<I, keyof M> & M;

// Base types for makers / publishers

type MPConfig = unknown | {
  /** Maker or publisher specific set of options. */
  options?: unknown;
};

interface MPBase {
  /** Whenever given maker should be used. */
  enabled?: boolean;
  /** A Node.js package name that provides the maker or publisher functionality. */
  name: string;
  /** Overrides the platform that this maker or publisher will be used on.  */
  platforms?: ForgePlatform[] | null;
  /** A maker or publisher specific configuration object, usually containing the `options` property. */
  config?: MPConfig;
}

// Maker types

interface MakerAppImage extends MPBase {
  name: "@reforged/maker-appimage";
  config?: MakerAppImageConfig;
}

interface MakerDeb extends MPBase {
  name: "@electron-forge/maker-deb";
  config?: MakerDebConfig;
}

interface MakerRpm extends MPBase {
  name: "@electron-forge/maker-rpm";
  config?: MakerRpmConfig;
}

interface MakerSnap extends MPBase {
  name: "@electron-forge/maker-snap";
  config?: MakerSnapConfig;
}

interface MakerFlatpak extends MPBase {
  name: "@electron-forge/maker-flatpak";
  config?: MakerFlatpakConfig;
}

interface MakerZIP extends MPBase {
  name: "@electron-forge/maker-zip";
  config?: MakerZIPConfig;
}

interface MakerDMG extends MPBase {
  name: "@electron-forge/maker-dmg";
  config?: MakerDMGConfig;
}

interface MakerWix extends MPBase {
  name: "@electron-forge/maker-wix";
  config?: MakerWixConfig;
}

interface MakerSquirrel extends MPBase {
  name: "@electron-forge/maker-squirrel";
  config?: MakerSquirrelConfig;
}

// Publisher types

interface PublisherGitHub extends MPBase {
  name: "@electron-forge/publisher-github";
  config?: PublisherGitHubConfig;
}

// Config type

export type ForgeConfigFile = Redeclare<Partial<ForgeConfig>, {
  makers?: (
    MakerZIP | MakerAppImage | MakerDeb | MakerRpm | MakerDMG | MakerFlatpak | MakerWix | MakerSquirrel | MakerSnap
  )[];
  publishers?: (
    PublisherGitHub
  )[];
  hooks?: Redeclare<ForgeHookMap, {
    packageAfterCopy: (ForgeConfig: ResolvedForgeConfig, path:string, electronVersion: string, platform: ForgePlatform) => unknown;
    packageAfterExtract: (ForgeConfig: ResolvedForgeConfig, path:string, electronVersion: string, platform: ForgePlatform) => unknown;
  }>;
}>;