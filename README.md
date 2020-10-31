# Electron Discord WebApp
A Discord Web App based on the [Electron](https://github.com/electron/electron) engine.

It is completely indpenendent from [Discord-Electron](https://github.com/GyozaGuy/Discord-Electron), but I used it to learn why my previous attepms of doing electron discord app have failed – it was because `nodeIntegration` was set to `true`. So thanks to the author for that comment he typed – wouldn't probably know that without checking it!

I previously forked his work, but now "I've stolen what's mine" from the code I've written in the fork, polished it a little and done this project. I've rewritten it from scratch, so it's simpler than it were before (for me) ~~and actually removes the "variable hell" of the original project~~.

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
You can run it and install as nodejs module with:
```sh
npm install && npm run dist
```
See [their docs](https://www.electron.build/multi-platform-build) if you wish to learn it's usage or type `npm run dist --help` for the built-in help.

I've also made a quick script to produce binaries for all architectures on Linux:
```sh
npm run build-linux
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
