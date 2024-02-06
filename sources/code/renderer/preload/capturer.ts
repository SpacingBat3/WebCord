import { ipcRenderer as ipc } from "electron/renderer";
import L10N from "../../common/modules/l10n";
import type { AppConfig } from "../../main/modules/config";

function translate(string:string):string {
  const l10n = new L10N().client.dialog.screenShare.source;
  return string
    .replace("Entire Screen", l10n.entire)
    .replace("Screen", l10n.screen);
}

function renderCapturerContainer(sources:Electron.DesktopCapturerSource[]) {
  const list = document.getElementById("capturer-list");
  if(list === null) throw new Error("Element of ID: 'capturer-list' does not exists!");
  for (const source of sources) {
    // Item
    const item = document.createElement("li");
    item.className = "capturer-item";

    // Button
    const button = document.createElement("button");
    button.className = "capturer-button";
    button.setAttribute("data-id", source.id);
    button.setAttribute("title", translate(source.name));

    // Thumbnail
    const thumbnail = document.createElement("img");
    thumbnail.className = "capturer-thumbnail";
    thumbnail.src = source.thumbnail.toDataURL();
    button.appendChild(thumbnail);

    // A container for icon and label
    const labelContainer = document.createElement("div");
    labelContainer.className = "capturer-label-container";

    // Icon
    if (source.appIcon as typeof source["appIcon"]|null) {
      const icon = document.createElement("img");
      icon.className = "capturer-label-icon";
      icon.src = source.appIcon.toDataURL();
      labelContainer.appendChild(icon);
    }

    // Label
    const label = document.createElement("span");
    label.className = "capturer-label";
    label.innerText = translate(source.name);
    labelContainer.appendChild(label);

    button.appendChild(labelContainer);
    item.appendChild(button);
    list.appendChild(item);
  }
}

type ExpectedIncomingResult = Electron.DesktopCapturerSource[];

const audioSupport = process.platform === "win32" || (
  process.platform !== "darwin" && Number(process.versions.electron.split(".")[0]) >= 29
);

window.addEventListener("DOMContentLoaded", () => {
  const audioButton = document.getElementById("capturer-sound") as HTMLInputElement|null;
  ipc.invoke("getDesktopCapturerSources")
    .then((result:null|ExpectedIncomingResult) => {
      if(result === null) {
        ipc.send("closeCapturerView", null);
      } else {
        {
          const l10n = new L10N().client.dialog.screenShare;
          const closeButton = document.getElementById("capturer-close") as HTMLButtonElement|null;
          if(audioSupport && audioButton) {
            audioButton.disabled = false;
            audioButton.title = l10n.sound.system;
            void ipc.invoke("capturer-get-settings")
              .then((settings:AppConfig["screenShareStore"]) => {
                audioButton.checked = settings.audio;
              });
            audioButton.addEventListener("click", () => ipc.send("settings-config-modified", {
              screenShareStore: {
                audio: audioButton.checked
              }
            }));
          } else if(audioButton) {
            audioButton.title = l10n.sound.unavailable;
            audioButton.disabled = true;
          }
          if(closeButton) closeButton.title = l10n.close;
        }
        try {
          renderCapturerContainer(result);
          [...document.querySelectorAll(".capturer-button")].map(button =>
            button.addEventListener("click", () => {
              const bid = button.getAttribute("data-id");
              const {id, name} = result.find(source => source.id === bid) ?? {};
              if (id === undefined || name === undefined) {
                throw new Error('Source with id: "' + (id ?? "[null]") + '" does not exist!');
              }
              ipc.send("closeCapturerView", {
                video: { id, name } satisfies Electron.Video,
                ...((audioButton?.checked??false)&&audioSupport ?
                  { audio: "loopbackWithMute" } : {}
                )
              } satisfies Electron.Streams);
            })
          );
          document.getElementById("capturer-close")
            ?.addEventListener("click", () => ipc.send("closeCapturerView", null));
        } catch {
          ipc.send("closeCapturerView", null);
        }
      }
    })
    .catch(() => ipc.send("closeCapturerView", null));
});