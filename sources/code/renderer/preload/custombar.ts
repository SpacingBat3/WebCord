import { ipcRenderer as ipc } from "electron/renderer";

window.addEventListener("DOMContentLoaded", () => {
  /*
  * Custom title bar
  */

  const divs = document.body.getElementsByTagName("div");
  for (const element of divs) {
    const action = element.dataset["action"];
    if (action !== undefined){
      element.onclick = function (){
        ipc.send(action);
      };
    }
  }
});