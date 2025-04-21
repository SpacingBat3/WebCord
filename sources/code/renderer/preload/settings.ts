/*
 * HTML Settings preloader script
 */
import { ipcRenderer } from "electron/renderer";
import type { htmlConfig } from "../../main/windows/settings";
import type { configElement, checkListRecord } from "../../main/modules/config";
import { getBuildInfo } from "../../common/modules/client";
import { wLog, sanitizeConfig, knownInstancesList } from "../../common/global";
import { sanitize } from "dompurify";

type keys = <T>(o:T) => (keyof T)[];

//type generatedConfigGenericOld = Record<string,ConfigElement&Partial<Record<"name"|"description",string>&Record<"labels",Record<string,string|undefined>>>>;

type generatedConfigGeneric = {"name":string} & Record<string, Partial<Record<"name"|"description",string>> & (
  Exclude<configElement, checkListRecord> | (checkListRecord&{"labels": Record<string,string|undefined>;"info"?: Record<string,string>})
)>;

interface CommonForm {
  id: string;
  label:string;
  isChecked: boolean;
  description?: string|undefined;
  enabled?: boolean;
}

interface CheckBoxForm extends CommonForm {
  type: "checkbox";
}

interface RadioForm extends CommonForm {
  type: "radio";
  value: string;
}

const buildType = getBuildInfo().type;

function fetchFromWebsite(this: HTMLInputElement) {

  const dotArray = this.name.split(".");

  const value = (this.type === "checkbox" ? this.checked : parseInt(this.value));

  let config:Record<string, unknown> = {};

  config = {[dotArray[dotArray.length-1]??0]: value};
  for(let n = dotArray.length-2; n >= 0; n--)
    config = {[dotArray[n]??0]: config};

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

function checkPlatformKey(key:string) {
  switch(key as NodeJS.Platform|"unix"|"menuBar") {
    case "win32":
    case "darwin":  return process.platform === key;
    case "unix":    return process.platform !== "win32";
    case "menuBar": return process.platform !== "darwin";
    default:        return true;
  }
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
  if(form.description !== undefined) {
    inputTag.title = form.description;
    inputLabel.title = form.description;
  }
  if(!(form.enabled??true)) {
    inputLabel.classList.add("disabled");
    inputTag.disabled = true;
  }
  inputTag.addEventListener("change", fetchFromWebsite);
  inputLabel.innerHTML = sanitize(form.label+(inputTag.title !== "" ? " 🛈" : ""), sanitizeConfig);
  inputForm.append(inputTag,inputLabel);
  return inputForm;
}

function generateSettings(optionsGroups: htmlConfig) {
  // Clear old config (so this function can be executed multiple times).
  document.body.replaceChildren();
  for(const [groupId, group] of optionsGroups) {
    document.body.appendChild(document.createElement("h1"))
      .innerHTML = sanitize(group.name, sanitizeConfig);
    for(const settingKey of Object.keys(group)) if(settingKey !== "name" && settingKey !== buildType && checkPlatformKey(settingKey)) {
      const setting = (group as unknown as generatedConfigGeneric)[settingKey];
      if(setting) {
        // Skip unlocalized configurations.

        if(setting.name === undefined || setting.description === undefined) try {
          console.warn("Invalid configuration option: "+JSON.stringify(setting));
        } catch {
          console.warn("'setting' is not a valid object!");
        } finally {
          // eslint-disable-next-line no-unsafe-finally
          return;
        }
        // Generate forms
        const pDesc = document.createElement("p");
        const formContainer = document.createElement("form");
        pDesc.innerHTML = sanitize(setting.description);
        pDesc.classList.add("description");
        formContainer.classList.add("settingsContainer");

        if("radio" in setting) for(const [key,value] of (Object.entries(generateRadioLabels(settingKey))))
          formContainer.appendChild(createForm({
            type: "radio",
            id: groupId+"."+settingKey+".radio",
            isChecked: Number(key) === setting.radio,
            label: value[0],
            value: key,
            enabled: value[1],
          }));
        else if(!("dropdown" in setting || "input" in setting || "keybind" in setting))
          formContainer.append(...(Object.keys as keys)(setting)
            .sort()
            .filter(key => key !== "name" && key !== "description" && key !== "labels" && key !== "info" && setting[key] !== undefined)
            .map(key => createForm({
              type:"checkbox",
              id: groupId+"."+settingKey+"."+key,
              isChecked: setting[key] === true,
              label: setting.labels[key] ?? "N/A",
              description: setting.info?.[key] ?? undefined
            }))
          );
        else
          throw new Error("Still unimplemented / unsupported configuration type!");
        // Append elements to DOM tree
        document.body.appendChild(document.createElement("h2"))
          .innerHTML = sanitize(setting.name);
        document.body.append(pDesc,formContainer);
      }
    }
  }
}

window.addEventListener("load", () => void (async () => {
  generateSettings(
    await ipcRenderer.invoke("settings-generate-html", "ready-to-render") as htmlConfig
  );
  wLog("Settings preloaded!");
})());