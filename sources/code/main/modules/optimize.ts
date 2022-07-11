/**
 * Platform / hardware-specific Electron optimizations.
 */

import { app } from "electron/main";

/** Whenever the current process is ran on *nix. */
const isUnix = process.platform !== "win32" && process.platform !== "darwin";

interface partialGPU {
    gpuDevice: {
        active: boolean,
        driverVendor: string
    }[]
}

function hasGPUDevices(object: unknown):object is partialGPU {
  if(typeof object !== "object" || object === null)
    return false;
  if(!("gpuDevice" in object) || !Array.isArray((object as partialGPU).gpuDevice))
    return false;
  for(const device of (object as partialGPU).gpuDevice) {
    if(!("active" in device) || typeof device.active !== "boolean")
      return false;
    if(!("driverVendor" in device) || typeof device.driverVendor !== "string")
      return false;
  }
  return true;
}

/**
 * An experimental function that might return the flags, which seem to improve
 * a graphics rendering performance. Some flags might enable the features not
 * fully tested to work with every GPU card.
 * 
 * Unlike its name, Chromium developers seem to have the reason not to
 * enable this by the default – it is advised to test whenever this app performs
 * better or worse with these settings applied.
 */
export async function getRecommendedGPUFlags() {
  /**
     * Tries to guess the best GL backend for the current desktop enviroment
     * to use as native instead of ANGLE.
     * It is `desktop` by default (all platforms) and `egl` for wayland (*nix).
     */
  let desktopGl:"desktop"|"egl";

  if(isUnix && process.env["XDG_SESSION_TYPE"] === "wayland")
    desktopGl = "egl";
  else
    desktopGl = "desktop";

  const flags:([string]|[string,string])[] = [];
  const gpuInfoResult = await app.getGPUInfo("basic");
  if(hasGPUDevices(gpuInfoResult))
    for(const device of gpuInfoResult.gpuDevice) if(device.active) {
      switch(device.driverVendor.toLowerCase()) {
      // Common desktop GPU vendors.
        case "intel":
        case "amd":
        case "nvidia":
          flags.push(
          // use GL/GLES instead ANGLE:
            ["use-gl", desktopGl],
            // enable VA-API:
            ["enable-features", "VaapiVideoDecoder"],
            ["disable-features", "UseChromeOSDirectVideoDecoder"]
          );
          break;
        // Broadcom cards, commonly used in Raspberry Pi SBCs.
        case "broadcom":
          flags.push(
          /* Even if it does anything, it is a placebo effect
                         * (at least the last time I have checked, on VC6/RPi4)
                         * – it will likely do not much harm, even on X11.
                         */
            ["use-gl", "egl"]
          );
          break;
      }
      break;
    }
  return flags;
}

/**
 * An experimental function to return information about recommended flags to
 * improve the app's integration within the OS.
 * 
 * This is currently used only for Wayland to enable screen recording and use
 * recommended flags for native Wayland if `--ozone-platform=wayland` is used
 * (see {@link getRecommendedGPUFlags} for GPU optimizations for Wayland).
 */
export function getRedommendedOSFlags() {
  const flags: ([string]|[string,string])[] = [];
  if(isUnix) {
    if(process.argv.includes("--ozone-platform=wayland")) {
      flags.push(
        ["enable-features","UseOzonePlatform,WebRTCPipeWireCapturer,WaylandWindowDecorations"]
      );
    } else if(process.env["XDG_SESSION_TYPE"] === "wayland") {
      flags.push(
        ["enable-features","WebRTCPipeWireCapturer"]
      );
    }
  }
  return flags;
}