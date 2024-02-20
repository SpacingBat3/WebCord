/**
 * Platform / hardware-specific Electron optimizations.
 */

/** Whenever the current process is ran on *nix. */
const isUnix = process.platform !== "win32" && process.platform !== "darwin";

const isWaylandNative = isUnix && process.argv.includes("--ozone-platform=wayland") ||
  process.argv.includes("--ozone-hint=auto") ||
  process.argv.includes("--ozone-hint=wayland");

const isWayland = isUnix && (
  process.env["XDG_SESSION_TYPE"] === "wayland" ||
  process.env["WAYLAND_DISPLAY"] !== undefined ||
  isWaylandNative
);

/**
 * An experimental function that might return the flags, which seem to improve
 * a graphics rendering performance. Some flags might enable the features not
 * fully tested to work with every GPU card.
 * 
 * Unlike its name, Chromium developers seem to have the reason not to
 * enable this by the default – it is advised to test whenever this app performs
 * better or worse with these settings applied.
 */
export function getRecommendedGPUFlags() {
  const switches:([string]|[string,string])[] = [];
  // Use EGL on Wayland and ARM devices.
  if(isWayland || (isUnix && process.arch === "arm64"))
    switches.push(["use-gl", "egl"]);
  if(isUnix) {
    switches.push(
      // Enforce VA-API:
      ["enable-features", "VaapiVideoDecoder,VaapiVideoEncoder,VaapiIgnoreDriverChecks"],
      ["disable-features", "UseChromeOSDirectVideoDecoder"],
      // Bypass GPU blocklist:
      ["ignore-gpu-blocklist"],
      ["enable-zero-copy"]
    );
  }
  return switches;
}

/**
 * A function to return information about recommended flags to improve
 * the app's integration within the OS.
 */
export function getRecommendedOSFlags() {
  const switches: ([string]|[string,string])[] = [];
  // Recommended switches when running on Wayland Native
  if(isWaylandNative) switches.push(
    ["enable-features","UseOzonePlatform,WebRTCPipeWireCapturer,WaylandWindowDecorations"]
  );
  // Recommended switches for XWayland
  else if(isWayland) switches.push(
    ["enable-features","WebRTCPipeWireCapturer"]
  );
  return switches;
}