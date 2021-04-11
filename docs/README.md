<!--
				WebCord – README.md (Markdown + HTML)
-->
<h1><a href='https://discord.com'><img src='../icons/app.png' width='64px'></a> WebCord </h1>

[![MIT license](https://img.shields.io/badge/License-MIT-C23939.svg)](COPYING)
[![Electron](https://img.shields.io/badge/Made%20with-Electron-486F8F.svg)](https://www.electronjs.org/)
[![GitHub release](https://img.shields.io/github/release/SpacingBat3/electron-discord-webapp.svg)](../../../tags)
[![Github downloads](https://img.shields.io/github/downloads/SpacingBat3/electron-discord-webapp/total.svg)](../../../releases)
[![PRs Welcome](https://img.shields.io/badge/Pull%20requests-welcome-brightgreen.svg)](#want-to-contribute-to-my-project)
[![Pi-Apps badge](https://badgen.net/badge/Pi-Apps%3F/Yes!/c51a4a?icon=https://raw.githubusercontent.com/Botspot/pi-apps/master/icons/logo.svg)](https://github.com/Botspot/pi-apps)
![Unofficial Debian repository](https://img.shields.io/endpoint?url=https%3A%2F%2Frunkit.io%2Fspacingbat3%2Fwebcord-debian-badge%2Fbranches%2Fmaster)
[![Run tests](../../../actions/workflows/build.yml/badge.svg?event=push)](../../../actions/workflows/build.yml)

A Discord Web-based client made with the [Electron API](https://github.com/electron/electron), developed with the [Electron Forge](https://github.com/electron-userland/electron-forge).

It takes a differend approach from most client, as it isn't just a mod of the official client nor uses Discord API to be functional – it is currently based on the web version of the Discord, which makes it more trusted sollution in my opinion. As it even fakes it user agent to make it equal or similar to the one used by Chrome/Chromium, it is hard to detect it and ban users using it.

Previously, it began as a fork of the [Discord-Electron](https://github.com/GyozaGuy/Discord-Electron), but then eventually I had rewritten it from scratch and called *Electron Discord Web App*. But because [@GyozaGuy](https://github.com/GyozaGuy) made his own project, I learnt much about Electron and how to implement a Discord with it. Thanks to his work, this project could began on its own.

## Documentation:
- [Configuring the application](SETTINGS.md)
  - [Automatically hide menu bar](SETTINGS.md#auto-hide-menu-bar)
  - [Disable tray functionality](SETTINGS.md#disable-tray)
  - [Hide Discord's side bar](SETTINGS.md#hide-side-bar)
  - [About CSP settings](SETTINGS.md#content-security-policy-settings)
- [Contributing](CONTRIBUTING.md)
  - [Run from the sources](CONTRIBUTING.md#run)
  - [Creating the distributables](CONTRIBUTING.md#creating-distributables)
  - [Packaging the application](CONTRIBUTING.md#packaging)
- [Translating the application](TRANSLATE.md)
  - [JSON basics](TRANSLATE.md#dont-know-the-json-syntax)
  - [Credits](TRANSLATE.md#the-people-that-hepled-me-with-the-app-translation)
- [License](COPYING)

## License
This project is redistributed under the [MIT License](COPYING).

## Want to contribute to my project?
- If you want to improve my code, do a Pull Request and add yourself to the list of contributors in `main.ts`.
- If you want to translate strings in `lang` folder, please visit [TRANSLATE.md](TRANSLATE.md).

Never made a pull request before? Please reffer to [this website](http://makeapullrequest.com). 
