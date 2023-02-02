import {ipcRenderer as ipc} from "electron/renderer";
import L10N from "../../common/modules/l10n";

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
    button.setAttribute("text", translate(source.name));

    const iconSrc = (source.appIcon as typeof source["appIcon"] | null)?.toDataURL() ?? ""; // Do not display placeholder icons on wayland

    // Thumbnail
    if ((iconSrc.split(",")[1]?.length ?? 0) > 0) {
      const thumbnail = document.createElement("img");
      thumbnail.className = "capturer-thumbnail";
      thumbnail.src = source.thumbnail.toDataURL();
      button.appendChild(thumbnail);
    }

    // A container for icon and label
    const labelContainer = document.createElement("div");
    labelContainer.className = "capturer-label-container";

    // Icon
    if ((iconSrc.split(",")[1]?.length??0) > 0) {
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

function renderCapturerAudioContainer(sources: string[], ) {
  const list = document.getElementById("capturer-audio-list");
  if(list === null) throw new Error("Element of ID: 'capturer-list' does not exists!");
  for (const source of sources) {
    // Item
    const item = document.createElement("li");
    item.className = "capturer-audio-item";

    // Button
    const button = document.createElement("button");
    button.className = "capturer-audio-button";
    button.setAttribute("id", source);
    button.setAttribute("text", source);

    // Label
    const label = document.createElement("span");
    label.className = "capturer-audio-label";
    label.innerText = source;
    button.appendChild(label);

    item.appendChild(button);
    list.appendChild(item);
  }
}

type ExpectedIncomingResult = [
  /** List of sources fetched from the Electron API. */
  sources: Electron.DesktopCapturerSource[],
  /** Whenever audio has been enforced by command-line flags. */
  screenShareAudio: boolean,
  /** List of audio sources fetch from Pipewire */
  audioSources?: string[],
];

window.addEventListener("DOMContentLoaded", () => {
  let audioSupport = false;
  ipc.invoke("getDesktopCapturerSources")
    .then((result:null|ExpectedIncomingResult) => {
      if(result === null) {
        ipc.send("closeCapturerView", new Error("Unknown sources list."));
      } else {
        const selectedAudioNodes: string[] = [];
        {
          if((process.platform === "win32" || result[1])) {
            audioSupport = true;
          }
        }
        try {
          renderCapturerContainer(result[0]);
          [...document.querySelectorAll(".capturer-button")].map(button =>
            button.addEventListener("click", () => {
              const id = button.getAttribute("data-id");
              const source = result[0].find(source => source.id === id);
              if (!source) {
                throw new Error('Source with id: "' + (id ?? "[null]") + '" does not exist!');
              }
              ipc.send("closeCapturerView", {
                audio: audioSupport && (selectedAudioNodes.length > 0) ? {
                  mandatory: {
                    chromeMediaSource: "desktop"
                  }
                } : false,
                video: {
                  mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: source.id
                  }
                },
              },
              {
                selectedAudioNodes: result[2] ? selectedAudioNodes : null,
              });
            })
          );
          document.getElementById("capturer-close")
            ?.addEventListener("click", () => ipc.send("closeCapturerView", "Permission denied"));
        } catch(reason) {
          ipc.send("closeCapturerView", reason);
        }

        if (result[2] && result[2].length > 0) {
          try {
            renderCapturerAudioContainer(result[2]);
            [...document.querySelectorAll(".capturer-audio-button")].map(button => {
              button.addEventListener("click", () => {
                const id = button.getAttribute("id");
                if (id !== null) {
                  if (selectedAudioNodes.includes(id)) {
                    selectedAudioNodes.splice(selectedAudioNodes.indexOf(id), 1);
                    button.classList.remove("capturer-audio-button-selected");
                  }else {
                    selectedAudioNodes.push(id);
                    button.classList.add("capturer-audio-button-selected");
                  }
                }
              });
            });
          }
          catch(reason) {
            ipc.send("closeCapturerView", reason);
          }
        }
      }
    })
    .catch(reason => ipc.send("closeCapturerView", reason));
});