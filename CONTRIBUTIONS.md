# Notes about contribution
This file contains simplified usage of the Electron Forge to test and produce the distributables with the source code. For more detailed information, see [Electron Forge Docs](https://www.electronforge.io/).

## Run
JavaScript has a great advantage over the other standards to test an application without compiling the code – and this is also possible with the Electron-based software.
 
### How-to
Go to your cloned repository and execute this as a regular user:
```sh
npm i && npm start
```

## Creating distributables
Electron Forge allows to package the sources into the different standards – like DEB, SNAP or RPM.
With a help of my [AppImage maker fork](https://github.com/SpacingBat3/electron-forge-maker-appimage) it is even possible to package it to the AppImage standard.

### How-to
```sh
npm i && npm run make
```
Type `npm run make -- --help` in the Terminal for more advanced usage.

## Packaging
Sometimes you don't want to package the application (to quickly debug the application after packaging it) or there's no standard for your OS supported by the Electron Forge. Fortunelly, you can still produce the directory containing the electron binary for your OS and architecture and packaged sources in `app.asar` with the Electron Forge.

### How-to
```sh
npm i && npm run package
```
This will produce a `./out/Electron Discord Web App/` directory containig the electron binary with it's dependencies and the packaged application in `app.asar` format.
