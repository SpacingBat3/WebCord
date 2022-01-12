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

function generateLicenseContent(l10n:L10N["web"]["aboutWindow"], name:string) {
    const packageJson = new PackageJSON(["dependencies", "devDependencies"]);
    for (const id of ["appLicenseTitle","appLicenseBody","thirdPartyLicensesTitle", "thirdPartyLicensesBody"]) {
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

ipc.on("about.getDetails", (_event, details:{appName: string, appVersion: string, buildInfo: buildInfo, responseId: number}) => {
    const l10n = new L10N().web.aboutWindow;
    // Header sections names
    for(const div of document.querySelectorAll<HTMLDivElement>("nav > div")) {
        const content = div.querySelector<HTMLDivElement>("div.content");
        if(content) content.innerText = l10n[(div.id.replace("-nav","") as keyof typeof l10n)].nav
    }
    const nameElement = document.getElementById("appName");
    const versionElement = document.getElementById("appVersion");
    if(!nameElement || !versionElement) return;
    nameElement.innerText = details.appName + " ("+details.buildInfo.type+")";
    versionElement.innerText = details.appVersion + (details.buildInfo.commit !== undefined ? "-"+details.buildInfo.commit.substring(0, 7) : "");
    (document.getElementById("logo") as HTMLImageElement).src = getAppIcon([256,192,128,96])
    generateLicenseContent(l10n, details.appName);
    document.body.style.display = "initial";
    ipc.send("about.readyToShow");
});