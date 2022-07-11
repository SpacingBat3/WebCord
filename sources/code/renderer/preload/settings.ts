/**
 * HTML Settings preloader script
 * @todo: Implement "Save changes" and "Cancel" buttons
 * @todo: Implement script inside WebCord
 */
import { ipcRenderer } from "electron/renderer";
//import type { HTMLChecklistForms, HTMLRadioCustom, HTMLRadioForms, HTMLRadioOption, HTMLSettingsGroup } from "../../common/global";
import type { htmlConfig } from "../../main/windows/settings";
import type { ConfigElement } from "../../main/modules/config";
import { getBuildInfo } from "../../common/modules/client";
import { wLog, sanitizeConfig } from "../../common/global";
import { sanitize } from "dompurify";

type keys = <T>(o:T) => (keyof T)[];

type generatedConfigGeneric = Record<string,ConfigElement&Record<"name"|"description",string>&Record<"labels",Record<string,string|undefined>>>

const buildType = getBuildInfo().type;

/*function isChecklistForms(arg: HTMLRadioForms|HTMLChecklistForms|HTMLRadioCustom):arg is HTMLChecklistForms {
  return (arg as unknown as HTMLChecklistForms).id !== undefined
}*/

function fetchFromWebsite(this: HTMLInputElement) {

  const dotArray = this.name.split(".");

  const value = (this.type === "checkbox" ? this.checked : parseInt(this.value))

  let config:Record<string, unknown> = {};

  config = {[dotArray[dotArray.length-1]??0]: value};
  for(let n = dotArray.length-2; n >= 0; n--)
    config = {[dotArray[n]??0]: config}
  console.dir({settings: config});
  ipcRenderer.send("settings-config-modified", {settings: config});
}

function generateSettings(optionsGroups: htmlConfig) {
  // Clear old config (so this function can be executed multiple times).
  document.body.innerHTML = "";
  optionsGroups.map(groupArray => {
    const [groupId, group] = groupArray;
    const h1 = document.createElement("h1");
    h1.innerHTML = sanitize(group.name, sanitizeConfig);
    document.body.appendChild(h1);
    (Object.keys)(group).map(settingKey => {
      if(settingKey !== "name" && settingKey !== buildType) {
        const setting = (group as unknown as generatedConfigGeneric)[settingKey]
        if(setting) {
          const h2 = document.createElement("h2");
          const pDesc = document.createElement("p");
          const formContainer = document.createElement("form");

          h2.innerHTML = sanitize(setting.name);
          pDesc.classList.add("description");
          pDesc.innerHTML = sanitize(setting.description);
          formContainer.classList.add("settingsContainer");

          if("radio" in setting) {
            const types = setting.type.split("|")
            types.map(value => {
              formContainer.appendChild(createForm({
                type: "radio",
                id: groupId+"."+settingKey+".radio",
                isChecked: value === types[setting.radio],
                label: value,
                value: types.indexOf(value).toString()
              }))
            })
          } else if(!("dropdown" in setting || "input" in setting || "keybind" in setting)) {
            (Object.keys as keys)(setting).map(key => {
              if(key !== "name" && key !== "description" && key !== "labels" && setting[key] !== undefined) {
                formContainer.appendChild(createForm({
                  type:"checkbox",
                  id: groupId+"."+settingKey+"."+key,
                  isChecked: setting[key] as boolean,
                  label: setting.labels[key] ?? "N/A"
                }));
              }
            })
          } else {
            throw new Error("Still unimplemented / unsupported configuration type!");
          }
          document.body.appendChild(h2);
          document.body.appendChild(pDesc);
          document.body.appendChild(formContainer);
        }
      }
    })
  })
}

interface CommonForm {
  id: string;
  label:string;
  isChecked: boolean;
  description?: string;
}

interface CheckBoxForm extends CommonForm {
  type: "checkbox";
}

interface RadioForm extends CommonForm {
  type: "radio";
  value: string;
}

function createForm(form:CheckBoxForm|RadioForm){
  const inputForm = document.createElement("fieldset");
  const inputTag = document.createElement("input");
  const inputLabel = document.createElement("label");
  inputTag.type = form.type;
  inputTag.name = form.id;
  inputTag.checked = form.isChecked;
  switch(form.type){
    case "checkbox":
      inputTag.id = form.id;
      break;
    case "radio":
      inputTag.id = form.id+form.value;
      inputTag.value = form.value;
      break;
  }
  inputLabel.setAttribute("for", inputTag.id)
  if(form.description) {
    inputTag.title = form.description
    inputLabel.title = form.description
  }
  inputTag.addEventListener("change", fetchFromWebsite);
  inputLabel.innerHTML = sanitize(form.label+(inputTag.title !== "" ? " 🛈" : ""));
  inputForm.appendChild(inputTag);
  inputForm.appendChild(inputLabel);
  return inputForm;
}

/*
function generateSettingsOld(optionsGroups: HTMLSettingsGroup[]) {
  // Clear old config (so this function can be executed multiple times).
  document.body.innerHTML = "";
  // Generate a list of the settings from given configuration
  for (const group of optionsGroups) {
    // Title of the settings group, e.g. "Advanced"
    const h1 = document.createElement("h1");

    // Makes sure title is appended first
    h1.innerHTML = sanitize(group.title, sanitizeConfig);
    document.body.appendChild(h1);

    for (const option of group.options) {
      const h2 = document.createElement("h2");
      const pDesc = document.createElement("p");
      const checklistContainer = document.createElement("form");

      // Title for various options, e.g. "Disable tray"
      h2.innerHTML = sanitize(option.name, sanitizeConfig);
      pDesc.className = "description";
      pDesc.innerHTML = sanitize(option.description, sanitizeConfig);
      checklistContainer.className = "settingsContainer";

      // Hide all elements when option is set as hidden
      if(option.hidden === true) {
        h2.style.display = "none";
        pDesc.style.display = "none";
        checklistContainer.style.display = "none";
      }

      // A list of check boxes for a single opiton.
      for (const checklist of option.forms) {
        const inputForm = document.createElement("fieldset");
        const inputTag = document.createElement("input");
        const inputLabel = document.createElement("label");

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
        inputTag.addEventListener("change", fetchFromWebsite);

        inputLabel.innerHTML = sanitize(checklist.label+(inputTag.title !== "" ? " 🛈" : ""));
        if(isChecklistForms(checklist))
          inputLabel.setAttribute("for", checklist.id);


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
*/

window.addEventListener("load", () => {
  void ipcRenderer.invoke("settings-generate-html", "ready-to-render")
    .then((args:htmlConfig) => {
      generateSettings(args);
      wLog("Settings preloaded!");
    });
});