import { desktopCapturer } from 'electron';
import { readFileSync } from 'fs';
import * as path from 'path';

interface EMediaStreamConstraints extends MediaStreamConstraints {
    audio?: boolean | EMediaTrackConstraints;
    video?: boolean | EMediaTrackConstraints;
}

interface EMediaTrackConstraints extends MediaTrackConstraints {
    mandatory: {
        chromeMediaSource: string;
        chromeMediaSourceId: string;
    };
}

function renderCapturerContainer(sources:Electron.DesktopCapturerSource[]) {
    // Container
    const container = document.createElement('div');
    container.setAttribute('class', 'capturer-selection');

    // Style
    const style = document.createElement('style');
    style.innerHTML = readFileSync(
        path.resolve(__dirname, '../../../assets/web/css/capturer.css')
    ).toString();
    container.appendChild(style);

    // Scroller
    const scroller = document.createElement('div');
    scroller.className = "capturer-scroller";

    // Selection list
    const list = document.createElement('ul');
    list.className = "capturer-list";

    // Selection items
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
    scroller.appendChild(list);

    // Close button
    const buttonClose = document.createElement('button');
    buttonClose.className = "capturer-close";
    buttonClose.innerText = "✕";

    scroller.appendChild(buttonClose);
    container.appendChild(scroller);
    document.body.appendChild(container);
    return container;
}

export default function desktopCapturerPicker(): Promise<EMediaStreamConstraints> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            const sources = await desktopCapturer.getSources({ types: ['screen', 'window'], fetchWindowIcons: true });
            const container = renderCapturerContainer(sources);

            for (const button of document.querySelectorAll('.capturer-button'))
                button.addEventListener('click', () => {
                    try {
                        const id = button.getAttribute('data-id');
                        const source = sources.find(source => source.id === id);
                        if (!source) {
                            throw new Error('Source with id: "' + id + '" does not exist!');
                        }
                        const constrains: EMediaStreamConstraints = {
                            audio: false,
                            video: {
                                mandatory: {
                                    chromeMediaSource: 'desktop',
                                    chromeMediaSourceId: source.id
                                }
                            }
                        };
                        resolve(constrains);
                        container.remove();
                    } catch (err) {
                        console.error('[ERROR] Failed to select desktop capture source: "' + err + '"!');
                        reject(err);
                    }
                });
            document.querySelector('.capturer-close')
                ?.addEventListener('click', () => container.remove());
        } catch (err) {
            console.error('[ERROR] Failed to display desktop capture sources: "' + err + '"!');
            reject(err);
        }
    });
}
