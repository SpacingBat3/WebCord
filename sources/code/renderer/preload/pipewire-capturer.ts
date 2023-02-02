import {ipcRenderer as ipc} from "electron/renderer";
import L10N from "../../common/modules/l10n";

function translate(string:string):string {
  const l10n = new L10N().client.dialog.screenShare.source;
  return string
    .replace("Entire Screen", l10n.entire)
    .replace("Screen", l10n.screen);
}

function renderCapturerContainer(sources:Electron.DesktopCapturerSource[], selectedAudioNodes: string[]) {
  const list = document.getElementById("capturer-list");
  if(list === null) throw new Error("Element of ID: 'capturer-list' does not exists!");
  // Clear list
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
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

  [...document.querySelectorAll(".capturer-button")].map(button =>
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const source = sources.find(source => source.id === id);
      if (!source) {
        throw new Error('Source with id: "' + (id ?? "[null]") + '" does not exist!');
      }
      ipc.send("closeCapturerView", {
        audio: (selectedAudioNodes.length > 0) ? {
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
        selectedAudioNodes: selectedAudioNodes,
      });
    })
  );
}

function renderCapturerAudioContainer(sources: string[], selectedAudioNodes: string[]) {
  const list = document.getElementById("capturer-audio-list");
  if(list === null) throw new Error("Element of ID: 'capturer-list' does not exists!");
  // Clear list
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
  for (const source of sources) {
    // Item
    const item = document.createElement("li");
    item.className = "capturer-audio-item";

    // Button
    const button = document.createElement("button");
    button.className = "capturer-audio-button";
    button.setAttribute("id", source);
    button.setAttribute("text", source);

    if (selectedAudioNodes.includes(source)) {
      button.classList.add("capturer-audio-button-selected");
    }

    // Label
    const label = document.createElement("span");
    label.className = "capturer-audio-label";
    label.innerText = source;
    button.appendChild(label);

    item.appendChild(button);
    list.appendChild(item);
  }

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

type ExpectedIncomingResult = [
  /** List of sources fetched from the Electron API. */
  sources: Electron.DesktopCapturerSource[],
  /** Whenever audio has been enforced by command-line flags. */
  screenShareAudio: boolean,
  /** List of audio sources fetch from Pipewire */
  audioSources?: string[],
];

window.addEventListener("DOMContentLoaded", () => {
  let selectedAudioNodes: string[] = [];
  let newActualSources: ExpectedIncomingResult = [[], false];

  const getActualSourcesInterval = setInterval(() => {
    ipc.invoke("getActualSources")
      .then((result: null|ExpectedIncomingResult) => {
        if (result) {
          newActualSources = result;
          // Check if the selected audio sources are still available, if not, remove them
          selectedAudioNodes = selectedAudioNodes.filter((node) => newActualSources[2]?.includes(node) ?? false);
          renderCapturerContainer(newActualSources[0], selectedAudioNodes);
          renderCapturerAudioContainer(newActualSources[2] ?? [], selectedAudioNodes);
        }
      }).catch((err) => {
        console.error(err);
        clearInterval(getActualSourcesInterval);
      });
  }, 1000);

  ipc.invoke("getDesktopCapturerSources")
    .then((result:null|ExpectedIncomingResult) => {
      if(result === null) {
        ipc.send("closeCapturerView", new Error("Unknown sources list."));
        return;
      }

      try {
        renderCapturerContainer(result[0], selectedAudioNodes);
        renderCapturerAudioContainer(result[2] ?? [], selectedAudioNodes);
        document.getElementById("capturer-close")
          ?.addEventListener("click", () => {
            clearInterval(getActualSourcesInterval);
            ipc.send("closeCapturerView", "Permission denied");
          });
      } catch(reason) {
        clearInterval(getActualSourcesInterval);
        ipc.send("closeCapturerView", reason);
      }
      
    })
    .catch(reason => {
      clearInterval(getActualSourcesInterval);
      ipc.send("closeCapturerView", reason);
    });
});