# Notes about contribution
This file contains simplified usage of the Electron Forge to test and produce
the distributables with the source code. For more detailed information, see
[Electron Forge Docs](https://www.electronforge.io/).

## Run
TypeScript has one great advantage over the JavaScript: it is compiled to
"JavaScript" each time before running the app from the sources, making it easier
to fix common syntax errors before publishing them. However, this also means the
app will start slower on the first run and it needs to be "recompiled" each time
there's an update.
 
### How-to
Go to your cloned repository and execute this as a regular user:
```sh
npm i && npm start
```
If you want to re-run app after you ran it with `npm start` before (and you
haven't done any update to the sources), you can then execute it with:
```
npm run start:fast
```

## Creating distributables
Electron Forge allows to package the sources into the different standards – like
DEB, SNAP or RPM. With a help of my
[AppImage maker fork](https://github.com/SpacingBat3/electron-forge-maker-appimage)
it is even possible to package it to the AppImage standard.

### How-to
```sh
npm i && npm run make
```
Type `npm run make -- --help` in the terminal for more advanced usage.

## Packaging
Sometimes you don't want to package the application (to quickly debug the
application after packaging it) or there's no standard for your OS supported by
the Electron Forge. Fortunately, you can still produce the directory containing
the electron binary for your OS and architecture and packaged sources in
`app.asar` with the Electron Forge.

### How-to
```sh
npm i && npm run package
```
This will produce a `./out/Electron Discord Web App/` directory containig the
electron binary with it's dependencies and the packaged application in `app.asar`
format.

## Other usefull information

### `*:fast` scripts
Most of the script has it's `*:fast` counterpart. This was made due *normal*
version always runs the `tsc` to update/compile JavaScript files each time
before `electron-forge` is executed and `*:fast` scripts are meant to solve that
– they are similar to regular versions of the scripts except `tsc` execution is
skipped, which saves time recreating same file.

Currently, only `test` and `lint` scripts has no `:fast` equivalent.