import { ipcRenderer as ipc } from "electron";
import { buildInfo, getAppIcon } from "../../global/global";
import { getAppPath } from "../../global/modules/electron";
import { resolve } from "path";
import L10N from "../../global/modules/l10n";
import { PackageJSON, Person } from "../../global/modules/package";
/*import { createHash } from "crypto";

function getGithubAvatarUrl(user:string) {
    return "https://github.com/"+user+".png"
}

function getGravatarUrl(email:string) {
    return "https://gravatar.com/"+createHash("md5").update(email).digest('hex')
}*/

const locks = { 
    dialog: false
}

interface aboutWindowDetails {
    appName: string;
    appVersion: string;
    appRepo: string|undefined;
    buildInfo: buildInfo;
    responseId: number;
}

function showAppLicense() {
    if(!locks.dialog) {
        locks.dialog = true;
        void import('fs/promises')
            .then(fs => fs.readFile)
            .then(read => read(resolve(getAppPath(), 'LICENSE')))
            .then(data => data.toString())
            .then(license => {
                const dialog = document.createElement('div');
                const content = document.createElement('div');
                dialog.classList.add('dialog');
                console.log(license.replace(/\n(!=[^\n])/g,' '));
                content.innerText = license.replace(/(?<!\n)\n(?!\n)/g,' ');
                dialog.appendChild(content);
                document.getElementById("licenses")?.appendChild(dialog);
                dialog.addEventListener('click', () => {
                    dialog.remove()
                    locks.dialog = false;
                });
            });
    }
}

function generateAppContent(l10n:L10N["web"]["aboutWindow"], details:aboutWindowDetails) {
    const nameElement = document.getElementById("appName");
    const versionElement = document.getElementById("appVersion");
    const repoElement = document.getElementById("appRepo");
    if(!nameElement || !versionElement || !repoElement) return;
    nameElement.innerText = details.appName + " ("+details.buildInfo.type+")";
    versionElement.innerText = details.appVersion + (details.buildInfo.commit !== undefined ? "-"+details.buildInfo.commit.substring(0, 7) : "");
    (document.getElementById("logo") as HTMLImageElement).src = getAppIcon([256,192,128,96])
    
    if(repoElement.tagName === 'A')
        (repoElement as HTMLAnchorElement).href = details.appRepo??'';
    
    for (const id of Object.keys(l10n.about).filter((value)=>value!=="nav")) {
        const element = document.getElementById(id);
        if(element) 
            element.innerText = l10n.about[id as keyof typeof l10n.about]
    }
    for (const id of ['electron', 'chrome', 'node']) {
        const element = document.getElementById(id);
        if(element)
            element.innerText = process.versions[id as keyof typeof process.versions]??"unknown"
    }
}

function generateLicenseContent(l10n:L10N["web"]["aboutWindow"], name:string) {
    const packageJson = new PackageJSON(["dependencies", "devDependencies"]);
    for (const id of Object.keys(l10n.licenses).filter((value)=>value.match(/^(?:nav|licensedUnder|packageAuthors)$/) === null)) {
        const element = document.getElementById(id)
        if(element) 
            element.innerText = l10n.licenses[id as keyof typeof l10n.licenses]
                .replace("%s",name);
    }
    for (const packName in packageJson.data.dependencies) {
        if(packName.startsWith('@spacingbat3/')) continue;
        const {data} = new PackageJSON(
            ["author", "license"],
            resolve(getAppPath(), "node_modules/"+packName+"/package.json")
        )
        const npmLink = document.createElement("a");
        const title = document.createElement("h3");
        const copy = document.createElement("p");
        npmLink.href = "https://www.npmjs.com/package/"+packName;
        npmLink.relList.add("noreferrer");
        npmLink.target = "_blank";
        title.innerText = packName;
        copy.innerText = "© " +
            new Person(data.author ?? '"'+l10n.licenses.packageAuthors.replace("%s", packName)+'"').name + " " + l10n.licenses.licensedUnder.replace("%s",data.license)
        npmLink.appendChild(title);
        document.getElementById("licenses")?.appendChild(npmLink);
        document.getElementById("licenses")?.appendChild(copy);
    }
}

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

ipc.on("about.getDetails", (_event, details:aboutWindowDetails) => {
    const l10n = new L10N().web.aboutWindow;
    // Header sections names
    for(const div of document.querySelectorAll<HTMLDivElement>("nav > div")) {
        const content = div.querySelector<HTMLDivElement>("div.content");
        if(content) content.innerText = l10n[(div.id.replace("-nav","") as keyof typeof l10n)].nav
    }
    generateAppContent(l10n, details);
    generateLicenseContent(l10n, details.appName);
    // Initialize license button
    document.getElementById("showLicense")?.addEventListener("click", () => {
        for(const animation of document.getElementById("showLicense")?.getAnimations()??[]) {
            setTimeout(showAppLicense,100);
            animation.currentTime = 0;
            animation.play();
            animation.addEventListener("finish",()=>{
                animation.pause();
                animation.currentTime = 0;
            }, {once: true});
        }
    })
    document.body.style.display = "initial";
    ipc.send("about.readyToShow");
});