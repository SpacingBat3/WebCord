import { ipcRenderer as ipc, contextBridge } from "electron";
import { buildInfo } from "../../global/global";
/*import { createHash } from "crypto";

export function getGithubAvatarUrl(user:string) {
    return "https://github.com/"+user+".png"
}

export function getGravatarUrl(email:string) {
    return "https://gravatar.com/"+createHash("md5").update(email).digest('hex')
}*/

// Continue only on the local sites.
if(window.location.protocol !== "file:") {
    console.error("If you're seeing this, you probably have just messed something within the application. Congratulations!")
    throw new URIError("Loaded website is not a local page!")
}

// Because it is not a remote site, any API key would be OK
contextBridge.exposeInMainWorld("aboutWindow", {
    "close": () => {
        (window as unknown as {aboutWindow:unknown}).aboutWindow = undefined;
        ipc.send("about.close");
    }
})

// Get app details and inject them into the page
window.addEventListener("load", () => ipc.send("about.getDetails"));

ipc.on("about.getDetails", (_event, details:{appName: string, appVersion: string, buildInfo: buildInfo, responseId: number}) => {
    const nameElement = document.getElementById("appName");
    const versionElement = document.getElementById("appVersion");
    if(!nameElement || !versionElement) return;
    nameElement.innerText = details.appName + " ("+details.buildInfo.type+")"
    versionElement.innerText = details.appVersion + (details.buildInfo.commit ? "-"+details.buildInfo.commit.substring(0, 7) : "")
    ipc.send("about.readyToShow");
});