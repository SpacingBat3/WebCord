/*
 * Cosmetic.ts – Website improvements for better integration within client
 */

import { wLog } from '../global.js'

function removeUnneded() {
    const orangePopup = document.querySelector('.notice-3bPHh-');
    const sideBarList = document.querySelectorAll('.listItem-GuPuDH');

    if (orangePopup!==null) orangePopup.remove(); // Remove ""
    if (sideBarList.length!==0) {
      sideBarList[sideBarList.length-1].remove(); // Remove "app download" button
      sideBarList[sideBarList.length-2].remove(); // Remove separator
      wLog("Successfully removed unnecesarry elements on website.");
    } else {
      wLog("Website hasn't been fully loaded yet, retrying after 0.5s...")
      setTimeout(removeUnneded, 500);
    }
}
window.onload = removeUnneded;