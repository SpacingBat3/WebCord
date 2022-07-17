/*
 * HTML Settings preloader script
 */
import { ipcRenderer } from "electron/renderer";
import type { htmlConfig } from "../../main/windows/settings";
import type { ConfigElement } from "../../main/modules/config";
import { getBuildInfo } from "../../common/modules/client";
import { wLog, sanitizeConfig, knownInstancesList } from "../../common/global";
import { sanitize } from "dompurify";

type keys = <T>(o:T) => (keyof T)[];

type generatedConfigGeneric = Record<string,ConfigElement&Record<"name"|"description",string>&Record<"labels",Record<string,string|undefined>>>;

const buildType = getBuildInfo().type;

function fetchFromWebsite(this: HTMLInputElement) {

  const dotArray = this.name.split(".");

  const value = (this.type === "checkbox" ? this.checked : parseInt(this.value));

  let config:Record<string, unknown> = {};

  config = {[dotArray[dotArray.length-1]??0]: value};
  for(let n = dotArray.length-2; n >= 0; n--)
    config = {[dotArray[n]??0]: config};
  console.dir({settings: config});
  ipcRenderer.send("settings-config-modified", {settings: config});
}

function generateRadioLabels(key:string) {
  switch(key) {
    case "currentInstance":
      return knownInstancesList.map(value => [value[0],value[2]] as const);
    default:
      throw new Error("Currently unsupported!");
  }
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
        const setting = (group as unknown as generatedConfigGeneric)[settingKey];
        if(setting) {
          const h2 = document.createElement("h2");
          const pDesc = document.createElement("p");
          const formContainer = document.createElement("form");

          h2.innerHTML = sanitize(setting.name);
          pDesc.classList.add("description");
          pDesc.innerHTML = sanitize(setting.description);
          formContainer.classList.add("settingsContainer");

          if("radio" in setting) {
            const types = generateRadioLabels(settingKey);
            types.map(value => {
              formContainer.appendChild(createForm({
                type: "radio",
                id: groupId+"."+settingKey+".radio",
                isChecked: value === types[setting.radio],
                label: value[0],
                value: types.indexOf(value).toString(),
                enabled: value[1],
              }));
            });
          } else if(!("dropdown" in setting || "input" in setting || "keybind" in setting)) {
            (Object.keys as keys)(setting).sort().map(key => {
              if(key !== "name" && key !== "description" && key !== "labels" && setting[key] !== undefined) {
                formContainer.appendChild(createForm({
                  type:"checkbox",
                  id: groupId+"."+settingKey+"."+key,
                  isChecked: setting[key] as boolean,
                  label: setting.labels[key] ?? "N/A"
                }));
              }
            });
          } else {
            throw new Error("Still unimplemented / unsupported configuration type!");
          }
          document.body.appendChild(h2);
          document.body.appendChild(pDesc);
          document.body.appendChild(formContainer);
        }
      }
    });
  });
}

interface CommonForm {
  id: string;
  label:string;
  isChecked: boolean;
  description?: string;
  enabled?: boolean;
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
  inputLabel.setAttribute("for", inputTag.id);
  if(form.description) {
    inputTag.title = form.description;
    inputLabel.title = form.description;
  }
  if(!(form.enabled??true)) {
    inputTag.disabled = true;
    inputLabel.classList.add("disabled");
  }
  inputTag.addEventListener("change", fetchFromWebsite);
  inputLabel.innerHTML = sanitize(form.label+(inputTag.title !== "" ? " 🛈" : ""));
  inputForm.appendChild(inputTag);
  inputForm.appendChild(inputLabel);
  return inputForm;
}

window.addEventListener("load", () => {
  void ipcRenderer.invoke("settings-generate-html", "ready-to-render")
    .then((args:htmlConfig) => {
      generateSettings(args);
      wLog("Settings preloaded!");
    });
});