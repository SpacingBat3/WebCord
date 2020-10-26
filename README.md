# Discord Electron
A Discord Web App based on the [Electron](https://github.com/electron/electron) engine.

It is completely indpenendent from [Discord-Electron](https://github.com/GyozaGuy/Discord-Electron), but I used it to learn why my previous attepms of doing electron discord app have failed – it was because `nodeIntegration` was set to `true`. So thanks to the author for that comment he typed – wouldn't probably know that without checking it!

I previously forked his work, but now "I've stolen what's mine" from the code I've written in the fork, polished it a little and done this project. I've rewritten it from scratch, so it's simpler than it were before (for me) ~~and actually removes the "variable hell" of the original project~~.

## Run
Go to your cloned repository and execute this as a regular user:
```sh
npm install && npm start
```

## Install
Check the [releases](https://github.com/SpacingBat3/electron-discord-webapp/releases/).

(Probably still empty through, so you need to run or build it by yourself)

## Build
I recommend building this app with the `electron-builder` tool.
You can install it on Linux using `npm` with the following command:
```sh
sudo npm install -g electron-builder
```
See [their docs](https://www.electron.build/multi-platform-build) if you wish to learn how to use it.

## License
This project is redistributed under the [MIT License](LICENSE).
