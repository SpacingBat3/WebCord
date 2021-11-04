/**
 * HTML Settings preloader script
 * @todo: Implement "Save changes" and "Cancel" buttons
 * @todo: Implement script inside WebCord
 */
import { ipcRenderer } from "electron";
import { HTMLSettingsGroup, wLog } from "../../global";
import { deepmerge } from "deepmerge-ts";
import { sanitize } from 'dompurify';
import DOMPurify = require("dompurify");

type sanitizeConfig = DOMPurify.Config & {
    RETURN_DOM_FRAGMENT?: false | undefined;
    RETURN_DOM?: false | undefined
}

const sanitizeConfig: sanitizeConfig = {
    // Allow tags that modifies text style and/or has a semantic meaning.
    ALLOWED_TAGS: ['b', 'i', 'u', 's', 'em', 'kbd', 'strong', 'code'],
    // Block every attribute
    ALLOWED_ATTR: []
}

function fetchFromWebsite() {
    const AllInputs = document.getElementsByTagName('input');
    const array: Record<string, unknown>[] = [];
    for (const input of AllInputs) {
        let configString: string;
        if (input.id.includes('csp-thirdparty.'))
            configString = '{"csp": {"thirdparty": {"' + input.id.split('.')[1] + '":' + input.checked + '} } }';
        else if (input.id.includes('.'))
            configString = '{"'+input.id.split('.')[0]+'": {"' + input.id.split('.')[1] + '":' + input.checked + '} }'
        else
            configString = '{"' + input.id + '": ' + input.checked + '}';
        array.push(JSON.parse(configString));
    }
    const config = deepmerge(...array);
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
            const checklistContainer = document.createElement('div');

            // Tittle for various options, e.g. "Disable tray"
            h2.innerHTML = sanitize(option.name, sanitizeConfig);
            pDesc.className = "description";
            pDesc.innerHTML = sanitize(option.description, {ALLOWED_TAGS: ['i', 'u', 'code'], ALLOWED_ATTR: []});
            checklistContainer.className = "settingsContainer";

            // Hide all elements when option is set as hidden
            if(option.hidden === true) {
                h2.style.display = 'none';
                pDesc.style.display = 'none';
                checklistContainer.style.display = 'none';
            }

            // A list of check boxes for a single opiton.
            for (const checklist of option.checklists) {
                const inputContainer = document.createElement('div');
                const inputTag = document.createElement('input');
                const inputLabel = document.createElement('label');

                inputContainer.className = "containerElement";
                inputTag.type = "checkbox";
                inputTag.id = checklist.id;
                inputTag.classList.add('checkbox');
                inputTag.checked = checklist.isChecked;
                inputLabel.innerHTML = sanitize(checklist.label);

                inputTag.addEventListener('change', fetchFromWebsite);

                inputContainer.appendChild(inputTag);
                inputContainer.appendChild(inputLabel);
                checklistContainer.appendChild(inputContainer);
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