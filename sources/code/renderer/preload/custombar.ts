const { ipcRenderer } = require('electron');

window.addEventListener("DOMContentLoaded", () => {
    /*
    * Custom title bar
    */

    const titlebar = document.createElement("div");
    titlebar.className = "titlebar";

    const title = document.createElement("div");
    // title.innerText = location.host.split(".")[0]!;
    title.innerText = "webcord";
    title.className = "title";
    const minimizebutton = document.createElement("div");
    minimizebutton.className = "minimizebutton btn";
    const maximizebutton = document.createElement("div");
    maximizebutton.className = "maximizebutton btn";
    const closebutton = document.createElement("div");
    closebutton.className = "closebutton btn";
    titlebar.appendChild(title);
    titlebar.appendChild(minimizebutton);
    titlebar.appendChild(maximizebutton);
    titlebar.appendChild(closebutton);
    document.body.prepend(titlebar);
    title.onclick = function () {
        ipcRenderer.send('opensettings', '')
    };
    minimizebutton.onclick = function () {
        ipcRenderer.send('window-minimize', '')
    };
    maximizebutton.onclick = function () {
        ipcRenderer.send('window-maximize', '')
    };
    closebutton.onclick = function () {
        ipcRenderer.send('window-close', '')
    };
});