/*
 * A place to move useful WebCord's function that could be exposed to
 * third-party addons in the future as part of planned "API".
 */

import { randomInt } from "crypto";

/**
 * Generates a random key of `window` that can safely be used as global variable
 * name in DOM scripts (both in means of beaing hard to detect and by not using
 * the already existing key name).
 */
export function generateSafeKey () {
  const charset = "abcdefghijklmnoprstuwxyzABCDEFGHIJKLMNOPRSTUWXYZ";
  let key = "";
  while(key === "" || key in window) {
    key = "";
    for(let i=0; i<=randomInt(4,32); i++)
      key += charset.charAt(randomInt(charset.length-1));
  }
  return key;
}

/**
 * Gets list of the elements with `tagName` tag name that has any class assigned
 * which its name includes the `searchString`. This tries to replicate the
 * similar behaviour as the one achieved by the `.getElementsByClassName`
 * method, except it can allow for part of the class names as an input.
 * 
 * This can be extremly useful when trying to tweak the elements whose class
 * names includes some part being randomly generated for each build/version.
 * 
 * **Currently unused in the code itself, reserved for WebCord's future API for
 * the extensions.**
 */
export function findClass<T extends keyof HTMLElementTagNameMap>(searchString: string, tagName: T) {
  const searchResult = new Set<string>();
  for (const container of document.getElementsByTagName<T>(tagName))
    for (const classString of container.classList)
      if(classString.includes(searchString))
        searchResult.add(classString);
  return [...searchResult];
}

/**
 * A function that allows the access to the Discord API without the need of
 * sharing the user token to the untrusted scripts. Currently at
 * **Work-in-Progress** state.
 * 
 * Currently unused in the code itself, reserved for WebCord's future API for
 * the extensions.**
 * 
 * @param method
 * @param apiVersion 
 * @param endpoint
 */
export function sendRequest(method:"POST"|"GET", apiVersion: 6|7|8|9|10, endpoint:string, body?: XMLHttpRequestBodyInit) {
  const request = new XMLHttpRequest();
  request.open(method,new URL(document.URL).origin+"/api/v"+apiVersion.toString()+endpoint);
  window.addEventListener("load", () => {
    const token = window.localStorage.getItem("token");
    if(token !== null) {
      request.setRequestHeader("Authorization", token);
      request.send(body);
      return;
    }
    request.abort();
    return;
  });
}

/**
 * Allows to navigate to the given path without reloading the entire Discord
 * page. In WebCord, this is used to handle `DEEP_LINK` requets.
 */
export function navigate(path:string) {
  // Push new state to history.
  history.pushState({}, "", path);
  // "Reload" history so Discord/Chromium can properly handle it.
  window.addEventListener("popstate", () => history.forward(), {once: true});
  history.back();
}