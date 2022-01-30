/*
 * Cosmetic.ts – Website improvements for better integration within client
 */

import { ipcRenderer } from 'electron';
import { wLog, knownIstancesList } from '../../global/global';
/**
 * Gets list of the elements with `tagName` tag name that has any class assigned
 * which its name includes the `searchString`. This tries to replicate the
 * similar behaviour as the one achieved by the `.getElementsByClassName`
 * method, except it can allow for part of the class names as an input.
 * 
 * This can be extremly useful when trying to tweak the sites whose class names
 * includes some part being randomly generated for each build/version.
 */

function findClass<T extends keyof HTMLElementTagNameMap>(searchString: string, tagName: T) {
  const searchResult = new Set<string>();
  for (const container of document.getElementsByTagName<T>(tagName))
    for (const classString of container.classList)
      if(classString.includes(searchString))
        searchResult.add(classString);
  return [...searchResult];
}

export default function preloadCosmetic(): void {
  let discordInstance = false
  for(const instance in knownIstancesList)
    if(window.location.origin === knownIstancesList[instance][1].origin) discordInstance = true;
  // Cancel further code execution for non-Discord/non-Fosscord instance sites.
  if(!discordInstance) return;
  /*
   * Hide orange popup about downloading the application.
   */
  ipcRenderer.once("webContents.did-stop-loading", () => window.localStorage.setItem('hideNag', 'true'));
  const removeUnneded = () => {
    // If user is at login/register website, do not apply any cosmetic changes
    if (document.URL.includes('login') || document.URL.includes('register')) {
      return;
    }
    // Get array of `div` elements
    const classList = [findClass('listItem-', 'div'), findClass('scroller-', 'div'), findClass('sidebar-', 'div')]

    if (classList[0].length === 1) {
      ipcRenderer.send('cosmetic.hideElementByClass', 'div.'+classList[1][0]+' > div.'+classList[0][0])
      ipcRenderer.once('cosmetic.hideElementByClass', () => wLog("Successfully removed unnecesarry elements on website."));
      ipcRenderer.send('cosmetic.sideBarClass', classList[2][0]);
      ipcRenderer.removeListener('webContents.did-stop-loading', removeUnneded)
    } else {
      wLog("COSMETIC: Couldn't find elements to remove, retrying on next event.");
      ipcRenderer.send("cosmetic.load");
    }
  };
  ipcRenderer.on("webContents.did-stop-loading", removeUnneded);
  window.addEventListener("load", () => ipcRenderer.send("cosmetic.load"), {once: true})
}