const copyYear = "2020-2021"

import { packageJson } from '../../global';
import { existsSync } from 'fs';
import { appInfo, guessDevel } from '../clientProperties';

import { app } from 'electron';
import l10n from '../l10nSupport';

const { devFlag } = guessDevel();


/*
 * Remember to add yourself to the 'contributors' array in the package.json
 * if you're improving the code of this application
 */

let appContributors: Array<string> = [packageJson.author.name];

// Hence GTK allows for tags there on Linux, generate links to website/email
if (process.platform === "linux") {

    if (packageJson.author.url)
        appContributors = ['<a href="' + packageJson.author.url + '">' + packageJson.author.name + '</a>'];

    else if (packageJson.author.email)
        appContributors = ['<a href="mailto:' + packageJson.author.email + '">' + packageJson.author.name + '</a>'];

}

// Generate contributors list and additionally try to parse if it is defined
if (packageJson.contributors !== undefined && packageJson.contributors.length > 0) {
    for (let n = 0; n < packageJson.contributors.length; n++) {
        // Guess "person" format:
        if (packageJson.contributors[n].name) {
            if (process.platform == "linux") {
                const { name, email, url } = packageJson.contributors[n];
                let linkTag = "", linkTagClose = "";
                if (url) {
                    linkTag = '<a href="' + url + '">';
                } else if (email) {
                    linkTag = '<a href="mailto:' + email + '">';
                }
                if (linkTag !== "") linkTagClose = "</a>";
                appContributors.push(linkTag + name + linkTagClose);
            } else {
                appContributors.push(packageJson.contributors[n].name);
            }
        } else {
            // TODO: Parse contributors string to generate a proper output (hyperlinks for Linux and name for others).
            appContributors.push(packageJson.contributors[n]);
        }
    }
}

// List of the contributors in form of the string
const stringContributors = appContributors.join(', ');

// "About" Panel:

export default function setAboutPanel(l10nStrings:l10n["strings"]): void {
    let iconPath: string;
    if (existsSync(appInfo.icon)) {
        iconPath = appInfo.icon;
    } else {
        iconPath = '/usr/share/icons/hicolor/512x512/apps/' + packageJson.name + '.png';
    }
    const aboutVersions = "Electron: " + process.versions.electron + "    Node: " + process.versions.node + "    Chromium: " + process.versions.chrome;
    app.setAboutPanelOptions({
        applicationName: app.getName(),
        applicationVersion: 'v' + app.getVersion() + devFlag,
        authors: appContributors,
        website: appInfo.URL,
        credits: l10nStrings.help.contributors + ' ' + stringContributors,
        copyright: 'MIT License\n' + 'Copyright © ' + copyYear + ' ' + packageJson.author.name + '\n\n' + l10nStrings.help.credits + '\n\n' + aboutVersions,
        iconPath: iconPath
    });
}