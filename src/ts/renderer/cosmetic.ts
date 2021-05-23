/*
 * Cosmetic.ts – Website improvements for better integration within client
 */

import { wLog } from '../global';

function removeUnneded() {
  // If user is at login/register website, do not apply any cosmetic changes
  if (document.URL.includes('login')||document.URL.includes('register')) return;

  const orangePopup = document.querySelector('.notice-3bPHh-');
  const sideBarList = document.querySelectorAll('.listItem-GuPuDH');

  if (orangePopup!==null) orangePopup.remove(); // Remove popup that appears when using Discord's web version
  if (sideBarList.length!==0) {
    sideBarList[sideBarList.length-1].remove(); // Remove "app download" button
    sideBarList[sideBarList.length-2].remove(); // Remove separator
    wLog("Successfully removed unnecesarry elements on website.");
  } else {
    wLog("Website hasn't been fully loaded yet, retrying after 0.5s...");
    setTimeout(removeUnneded, 500);
  }
}
window.onload = removeUnneded;