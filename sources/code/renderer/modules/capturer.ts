import { ipcRenderer as ipc } from "electron/renderer";

interface EMediaStreamConstraints extends MediaStreamConstraints {
    audio?: boolean | EMediaTrackConstraints;
    video?: boolean | EMediaTrackConstraints;
}

interface EMediaTrackConstraints extends MediaTrackConstraints {
    mandatory?: {
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
      const testValue = (object as Partial<EMediaStreamConstraints>)[child as keyof EMediaStreamConstraints];
      switch (typeof testValue) {
        case "boolean":
          break;
        case "object":
          if(typeof testValue?.mandatory === "object" &&
              typeof testValue?.mandatory?.chromeMediaSource !== "string")
            return false;
          if(typeof testValue?.mandatory !== "object" ||
              testValue?.mandatory !== undefined)
            return false;
          break;
        default:
          return false;
      }
    }
  return true;
}

export default function desktopCapturerPicker(api:string): Promise<EMediaStreamConstraints> {
  return new Promise((resolve,reject) => {
    ipc.invoke("desktopCapturerRequest", api).then((result:unknown) => {
      if(isMediaStreamConstrains(result)) {
        resolve(result);
      } else {
        reject(result);
      }
    }).catch((reason:unknown) => reject(reason));
  });
}