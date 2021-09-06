/*
 * Cosmetic.ts – Website improvements for better integration within client
 */

import { wLog } from '../global';

export default function preloadCosmetic(localStorage:Storage):void {
  localStorage.setItem('hideNag','true');
  const removeUnneded = () => {
    // If user is at login/register website, do not apply any cosmetic changes
    if (document.URL.includes('login')||document.URL.includes('register')) {
      window.addEventListener('popstate', removeUnneded, false);
      return
    }
    const sideBarList = document.querySelectorAll('.listItem-GuPuDH');
    if (sideBarList.length !== 0) {
      sideBarList[sideBarList.length-1].remove(); // Remove "app download" button
      sideBarList[sideBarList.length-2].remove(); // Remove separator
      wLog("Successfully removed unnecesarry elements on website.");
    } else {
      wLog("Website hasn't been fully loaded yet, retrying after 0.5s...");
      setTimeout(removeUnneded, 500);
    }
  }
  window.addEventListener('load', removeUnneded);
}