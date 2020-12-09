# Electron Discord WebApp
[![MIT license](https://img.shields.io/badge/License-MIT-C23939.svg)](./LICENSE.md)
[![Electron](https://img.shields.io/badge/Made%20with-Electron-486F8F.svg)](https://www.electronjs.org/)
[![GitHub release](https://img.shields.io/github/release/SpacingBat3/electron-discord-webapp.svg)](../../tags)
[![Github downloads](https://img.shields.io/github/downloads/SpacingBat3/electron-discord-webapp/total.svg)](../../releases)
[![GitHub contributors](https://img.shields.io/github/contributors/SpacingBat3/electron-discord-webapp.svg)](../../graphs/contributors)
[![PRs/Translations Welcome](https://img.shields.io/badge/PRs/Translations-welcome-brightgreen.svg)](#want-to-contribute-to-my-project)
[![Pi-Apps badge](https://badgen.net/badge/Pi-Apps%3F/Yes!/c51a4a?icon=https://raw.githubusercontent.com/Botspot/pi-apps/3d61f713573ba591aba50c32dd95c9df2f845b37/icons/logo.svg)](https://github.com/Botspot/pi-apps)

A Discord Web App based on the [Electron](https://github.com/electron/electron) engine.

It is completely indpenendent from [Discord-Electron](https://github.com/GyozaGuy/Discord-Electron), but I used it to learn why my previous attempts of doing electron discord app have failed – so I really apprieciate that someone wrote that code. I've previously forked his work, but right now I've made a seperate one – this fixed some issues that the fork had and overall improved multiple things a lot.

## Contents:
- [Run from the source](#run)
- [Install binaries](#install)
- [Build](#build)
- [Package](#package)
- [License](#license)
- [Contribution](#want-to-contribute-to-my-project)

## Run
Go to your cloned repository and execute this as a regular user:
```sh
npm install && npm start
```

## Install
Check the [releases](https://github.com/SpacingBat3/electron-discord-webapp/releases/).

## Build
I recommend building this app with the `electron-builder` tool.
Install it as node_module with:
```sh
npm install
```
The usage of it would be like:
```sh
# Build all on X86 hosts (both ARM and X86 targets)
# Also, use this command with flags instead of `dist-armhosts`
npm run dist
# Build all on ARM hosts (both ARM and X86 targets)
npm run dist-armhosts
```
If you want to run an `electron-builder` with flags, you can specify them you type `--`. For example:
```sh
npm run dist -- -l
```
will build the application with all supported flags on Linux.

For more flags and help with the usage, you can visit the [`electron-builder` docs](https://www.electron.build/) or type in the terminal:
```sh
npm run dist -- --help
```
## Package
The app uses also `electron-builder` to quickly produce unpackaged directory (eg. for testing purpouses).
You can use it (without globally installing it on your OS) like this:
```sh
npm install && npm run pack
```
This will produce a `./dist/*-unpackaged` directory containing the build.

## License
This project is redistributed under the [MIT License](LICENSE).

## Want to contribute to my project?
- If you want to improve my code, do a Pull Request and add yourself to the list of contributors in `main.js`.
- If you want to translate strings in `lang` folder, please visit [TRANSLATE.md](TRANSLATE.md).

Never made a pull request before? Please jump to [this website](http://makeapullrequest.com). 
