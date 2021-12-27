import { ipcRenderer as ipc } from "electron";
import { buildInfo } from "../../global/global";
import L10N from "../../global/modules/l10n";
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

// Get app details and inject them into the page
window.addEventListener("load", () => {
    ipc.send("about.getDetails");
    const close = document.getElementById("closebutton");
    if (close)
        close.addEventListener("click", () => {
            ipc.send("about.close");
        }, {once:true});
    else
        throw new Error("Couldn't find element with 'closebutton' id.");
});

ipc.on("about.getDetails", (_event, details:{appName: string, appVersion: string, buildInfo: buildInfo, responseId: number}) => {
    const l10n = new L10N().web.aboutWindow;
    for(const div of document.querySelectorAll<HTMLDivElement>("nav > div")) {
        const content = div.querySelector<HTMLDivElement>("div.content");
        if(content) content.innerText = l10n[(div.id.replace("-nav","") as keyof typeof l10n)]
    }
    const nameElement = document.getElementById("appName");
    const versionElement = document.getElementById("appVersion");
    if(!nameElement || !versionElement) return;
    nameElement.innerText = details.appName + " ("+details.buildInfo.type+")"
    versionElement.innerText = details.appVersion + (details.buildInfo.commit ? "-"+details.buildInfo.commit.substring(0, 7) : "")
    ipc.send("about.readyToShow");
});