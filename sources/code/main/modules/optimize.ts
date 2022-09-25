/**
 * Platform / hardware-specific Electron optimizations.
 */

import { app } from "electron/main";
import { gpuVendors } from "../../common/global";

/** Whenever the current process is ran on *nix. */
const isUnix = process.platform !== "win32" && process.platform !== "darwin";

const isWayland = process.env["XDG_SESSION_TYPE"] === "wayland" || process.env["WAYLAND_DISPLAY"] !== undefined;
const isWaylandNative = isWayland && (
  process.argv.includes("--ozone-platform=wayland") ||
  process.argv.includes("--ozone-hint=auto") ||
  process.argv.includes("--ozone-hint=wayland")
);

interface partialGPU {
  gpuDevice: {
    active: boolean;
    vendorId: number;
    deviceId: number;
  }[];
}

function hasGPUDevices(object: unknown):object is partialGPU {
  if(typeof object !== "object" || object === null)
    return false;
  if(!("gpuDevice" in object) || !Array.isArray((object as partialGPU).gpuDevice))
    return false;
  for(const device of (object as partialGPU).gpuDevice) {
    if(!("active" in device) || typeof device.active !== "boolean")
      return false;
    if(!("vendorId" in device) || typeof device.vendorId !== "number")
      return false;
    if(!("deviceId" in device) || typeof device.deviceId !== "number")
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
     * It is `desktop` by default (all platforms) and `egl` on WayLand (*nix).
     */
  let desktopGl:"desktop"|"egl";

  if(isUnix && isWayland)
    desktopGl = "egl";
  else
    desktopGl = "desktop";
  let activeGPU = false;
  const flags:([string]|[string,string])[] = [];
  const gpuInfoResult = await app.getGPUInfo("basic");
  if(hasGPUDevices(gpuInfoResult))
    loop: for(const device of gpuInfoResult.gpuDevice) if(device.active) switch(device.vendorId) {
      // Common desktop GPU vendors.
      case gpuVendors.intel:
      case gpuVendors.amd:
      case gpuVendors.nvidia:
        flags.push(
          // use GL/GLES instead ANGLE:
          ["use-gl", desktopGl],
          // enable VA-API:
          ["enable-features", "VaapiVideoDecoder,VaapiVideoEncoder"],
          ["disable-features", "UseChromeOSDirectVideoDecoder"]
        );
        activeGPU = true;
        break loop;
    }
  // Use OpenGL ES driver for Linux ARM devices.
  if(!activeGPU && isUnix && process.arch === "arm64")
    flags.push(["use-gl", "egl"]);
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
    if(isWaylandNative) {
      flags.push(
        ["enable-features","UseOzonePlatform,WebRTCPipeWireCapturer,WaylandWindowDecorations"]
      );
    } else if(isWayland) {
      flags.push(
        ["enable-features","WebRTCPipeWireCapturer"]
      );
    }
  }
  return flags;
}