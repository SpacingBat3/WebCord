/*
 * A place to move useful WebCord's function that could be exposed to
 * third-party addons in the future as part of planned "API".
 *
 * FIXME: it can be optimized for multiple operations.
 */

function randomInt(min = 0, max = 255) {
  const range = max - min;
  if(range < 0 || range > 255)
    throw new RangeError("Parameters 'min' and 'max' cannot be represented as 'u8'.");
  // We can guarantee fairness for binary
  let closestBin;
  // Naive impl
  for (closestBin = 1; closestBin <= range; closestBin <<= 1);
  closestBin -= 1;
  // Random byte generator
  let random: number|undefined;
  for (let maxTries = 30; maxTries > 0; --maxTries) {
    random = crypto.getRandomValues(new Uint8Array([0]))[0];
    if(random != undefined && (random &= closestBin) <= range)
      break;
  }
  if(random === undefined)
    throw new Error("Couldn't generate a valid pseudo-random number!");
  return random;
}

/**
 * Generates a random key of `window` that can safely be used as global variable
 * name in DOM scripts (both in means of being hard to detect and by not using
 * the already existing key name).
 */
export function generateSafeKey() {
  let key;
  do {
    key = "";
    for(let i=0; i<=randomInt(4,32); i++) {
      const cc = randomInt(0,51);
      key += String.fromCharCode(cc+(cc>25?71:65));
    }
  } while(key === "" || key in window);
  return key;
}

/**
 * Allows to navigate to the given path without reloading the entire Discord
 * page. In WebCord, this is used to handle `DEEP_LINK` requests.
 */
export function navigate(path:string) {
  // Push new state to history.
  history.pushState({}, "", path);
  // "Reload" history so Discord/Chromium can properly handle it.
  window.addEventListener("popstate", () => history.forward(), {once: true});
  history.back();
}