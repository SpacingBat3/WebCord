/**
 * HTML Settings preloader script
 * @todo: Implement "Save changes" and "Cancel" buttons
 * @todo: Implement script inside WebCord
 */
import { ipcRenderer } from "electron/renderer";
import type { HTMLChecklistForms, HTMLRadioCustom, HTMLRadioForms, HTMLRadioOption, HTMLSettingsGroup } from "../../common/global";
import { wLog, sanitizeConfig } from "../../common/global";
import { sanitize } from 'dompurify';

function isChecklistForms(arg: HTMLRadioForms|HTMLChecklistForms|HTMLRadioCustom):arg is HTMLChecklistForms {
    return (arg as unknown as HTMLChecklistForms).id !== undefined
}

function fetchFromWebsite(this: HTMLInputElement) {

    const dotArray = this.name.split('.');

    const value = (this.type === "checkbox" ? this.checked : parseInt(this.value))

    let config:Record<string, unknown> = {};

    config = {[dotArray[dotArray.length-1]??0]: value};
    for(let n = dotArray.length-2; n >= 0; n--)
        config = {[dotArray[n]??0]: config}
    console.log(config);
    ipcRenderer.send('settings-config-modified', config);
}

function generateSettings(optionsGroups: HTMLSettingsGroup[]) {
    // Clear old config (so this function can be executed multiple times).
    document.body.innerHTML = "";
    // Generate a list of the settings from given configuration
    for (const group of optionsGroups) {
        // Title of the settings group, e.g. "Advanced"
        const h1 = document.createElement('h1');

        // Makes sure title is appended first
        h1.innerHTML = sanitize(group.title, sanitizeConfig);
        document.body.appendChild(h1);

        for (const option of group.options) {
            const h2 = document.createElement('h2');
            const pDesc = document.createElement('p');
            const checklistContainer = document.createElement('form');

            // Tittle for various options, e.g. "Disable tray"
            h2.innerHTML = sanitize(option.name, sanitizeConfig);
            pDesc.className = "description";
            pDesc.innerHTML = sanitize(option.description, sanitizeConfig);
            checklistContainer.className = "settingsContainer";

            // Hide all elements when option is set as hidden
            if(option.hidden === true) {
                h2.style.display = 'none';
                pDesc.style.display = 'none';
                checklistContainer.style.display = 'none';
            }

            // A list of check boxes for a single opiton.
            for (const checklist of option.forms) {
                const inputForm = document.createElement('fieldset');
                const inputTag = document.createElement('input');
                const inputLabel = document.createElement('label');

                inputTag.type = option.type;
                if(isChecklistForms(checklist))
                    inputTag.name = inputTag.id = checklist.id;
                else {
                    inputTag.name = (option as HTMLRadioOption).id;
                    inputTag.value = checklist.value.toString();
                }
                inputTag.checked = checklist.isChecked;

                if(checklist.description) {
                    inputTag.title = checklist.description
                    inputLabel.title = checklist.description
                }
                inputTag.addEventListener('change', fetchFromWebsite);

                inputLabel.innerHTML = sanitize(checklist.label+(inputTag.title !== '' ? ' 🛈' : ''));
                if(isChecklistForms(checklist))
                    inputLabel.setAttribute('for', checklist.id);


                inputForm.appendChild(inputTag);
                inputForm.appendChild(inputLabel);
                checklistContainer.appendChild(inputForm);
            }
            document.body.appendChild(h2);
            document.body.appendChild(pDesc);
            document.body.appendChild(checklistContainer);
        }
    }
}

ipcRenderer.on('settings-generate-html', (_event, args: HTMLSettingsGroup[]) => {
    generateSettings(args);
    wLog("Settings preloaded!");
});

window.addEventListener('load', () => {
    ipcRenderer.send('settings-generate-html', 'ready-to-render');
});