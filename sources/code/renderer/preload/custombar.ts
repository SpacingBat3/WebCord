const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  /*
    * Custom title bar
    */

  const divs = document.body.getElementsByTagName('div');
  for (let i = 0; i < divs.length; i++) {
    const element = divs[i];
    const action = element?.dataset['action'];
    if (action){
      element.onclick = function (){
        ipcRenderer.send(action);
      }
    }
  }
});