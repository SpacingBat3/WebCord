/*
 * Cosmetic.ts – Website improvements for better integration within client
 */

import { ipcRenderer } from 'electron';
import { wLog, knownInstancesList } from '../../common/global';
import { findClass } from './api';

export default function preloadCosmetic(): void {
  let discordInstance = false
  for(const instance of knownInstancesList)
    if(window.location.origin === instance[1].origin) discordInstance = true;
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
    const classList = [findClass('listItem-', 'div'), findClass('scroller-', 'div'), findClass('sidebar-', 'div')] as const

    if (classList[0].length === 1) {
      ipcRenderer.send('cosmetic.hideElementByClass', 'div.'+(classList[1][0]??"")+' > div.'+(classList[0][0]??""))
      ipcRenderer.once('cosmetic.hideElementByClass', () => wLog("Successfully removed unnecesarry elements on website."));
      ipcRenderer.send('cosmetic.sideBarClass', classList[2][0]??"");
      ipcRenderer.removeListener('webContents.did-stop-loading', removeUnneded)
    } else {
      wLog("COSMETIC: Couldn't find elements to remove, retrying on next event.");
      ipcRenderer.send("cosmetic.load");
    }
  };
  ipcRenderer.on("webContents.did-stop-loading", removeUnneded);
  window.addEventListener("load", () => ipcRenderer.send("cosmetic.load"), {once: true});
}