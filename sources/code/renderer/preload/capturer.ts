import {ipcRenderer as ipc} from "electron/renderer";

function renderCapturerContainer(sources:Electron.DesktopCapturerSource[]) {
    const list = document.getElementById("capturer-list");
    if(list === null) throw new Error("Element of ID: 'capturer-list' does not exists!");
    for (const source of sources) {
        // Item
        const item = document.createElement('li');
        item.className = "capturer-item";

        // Button
        const button = document.createElement('button');
        button.className = "capturer-button";
        button.setAttribute('data-id', source.id);
        button.setAttribute('title', source.name);

        // Thumbnail
        const thumbnail = document.createElement('img');
        thumbnail.className = "capturer-thumbnail";
        thumbnail.src = source.thumbnail.toDataURL();
        button.appendChild(thumbnail);

        // A container for icon and label
        const labelContainer = document.createElement('div')
        labelContainer.className = "capturer-label-container"

        // Icon
        if (source.appIcon) {
            const icon = document.createElement('img');
            icon.className = "capturer-label-icon";
            icon.src = source.appIcon.toDataURL();
            labelContainer.appendChild(icon);
        }

        // Label
        const label = document.createElement('span');
        label.className = "capturer-label";
        label.innerText = source.name;
        labelContainer.appendChild(label);

        button.appendChild(labelContainer);
        item.appendChild(button);
        list.appendChild(item);
    }
}
window.addEventListener("load", () => {
    ipc.invoke("getDesktopCapturerSources").then((result:null|Electron.DesktopCapturerSource[]) => {
        if(result === null) {
            ipc.send("closeCapturerView", new Error("Unknown sources list."));
        } else {
            try {
                renderCapturerContainer(result);
                for (const button of document.querySelectorAll('.capturer-button'))
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        const source = result.find(source => source.id === id);
                        if (!source) {
                            throw new Error('Source with id: "' + (id ?? '[null]') + '" does not exist!');
                        }
                        ipc.send("closeCapturerView", {
                            audio: process.platform === "win32" ? {
                                mandatory: {
                                    chromeMediaSource: 'desktop'
                                }
                            } : false,
                            video: {
                                mandatory: {
                                    chromeMediaSource: 'desktop',
                                    chromeMediaSourceId: source.id
                                }
                            }
                        });
                    });
                document.getElementById('capturer-close')
                    ?.addEventListener('click', () => ipc.send("closeCapturerView", "Operation canceled by user"));
            } catch(reason) {
                ipc.send("closeCapturerView", reason);
            }
        }
    }).catch(reason => ipc.send("closeCapturerView", reason));
})