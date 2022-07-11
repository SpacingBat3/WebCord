import { ipcRenderer as ipc } from "electron/renderer";

interface EMediaStreamConstraints extends MediaStreamConstraints {
    audio?: boolean | EMediaTrackConstraints;
    video?: boolean | EMediaTrackConstraints;
}

interface EMediaTrackConstraints extends MediaTrackConstraints {
    mandatory: {
        chromeMediaSource: string;
        chromeMediaSourceId?: string;
    };
}

function isMediaStreamConstrains(object:unknown): object is EMediaStreamConstraints {
  if(!(object instanceof Object)) return false;
  for(const child of ["audio","video"])
    if(!(child in object))
      return false;
    else {
      const testValue = (object as EMediaStreamConstraints)[child as keyof EMediaStreamConstraints];
      switch (typeof testValue) {
        case "boolean":
          break;
        case "object":
          if("mandatory" in testValue && "chromeMediaSource" in testValue.mandatory)
            break;
          return false;
        default:
          return false;
      }
    }
  return true;
}

export default function desktopCapturerPicker(): Promise<EMediaStreamConstraints> {
  return new Promise((resolve,reject) => {
    ipc.invoke("desktopCapturerRequest").then((result:unknown) => {
      if(isMediaStreamConstrains(result)) {
        resolve(result);
      } else {
        reject(result);
      }
    }).catch((reason:unknown) => reject(reason));
  });
}