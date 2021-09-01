<!--                 Now featuring: Notepad-friendly comments! <3                      -->
<div align='right'>
<sub>
  Znasz 🇵🇱? Przejdź <a href='pl/Readme.md'>tutaj</a>.
</sub> <br>
</div>
<div align='center'>
<a href='https://github.com/SpacingBat3/WebCord'> <img src='../sources/assets/icons/app.png' width='192px'> </a>
<h1>WebCord</h1>

<!--
                                 ______________________
                                /                      \ Art by SpacingBat3
                                |                      | (IT'S NOT STOLEN :P)
                                |                      |
                                |     /--\____/--\     |
                                |    /   _    _   \    |
                                |   /   (_)  (_)   \   |
                                |  |     ______     |  |
                                |   \___/      \___/   |
                                |                      |
                                |                 \    |
                                \__________________\   |
                                                    \  |
                                                      \|
                                                        
						     
————————————————————————————————————— W e b C o r d —————————————————————————————————————

		         MIT • Electron • Pull Request Welcome • Pi Apps • Debian Repository
-->

[![MIT license](https://img.shields.io/github/license/SpacingBat3/WebCord?label=License)](../LICENSE)
[![GitHub release](https://img.shields.io/github/release/SpacingBat3/electron-discord-webapp.svg?label=Release)](https://github.com/SpacingBat3/WebCord/tags)
[![Electron](https://img.shields.io/github/package-json/dependency-version/SpacingBat3/WebCord/dev/electron?color=%236CB2BF&label=Electron)](https://www.electronjs.org/)
[![Github downloads](https://img.shields.io/github/downloads/SpacingBat3/electron-discord-webapp/total.svg?label=Downloads&color=%236586B3)](https://github.com/SpacingBat3/releases)
[![Build](https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Build&logo=github)](../../../actions/workflows/build.yml)
[![PRs Welcome](https://img.shields.io/badge/Pull%20requests-welcome-brightgreen.svg)](#want-to-contribute-to-my-project)
[![Pi-Apps badge](https://badgen.net/badge/Pi-Apps%3F/Yes!/c51a4a?icon=https://raw.githubusercontent.com/Botspot/pi-apps/master/icons/vector/logo.svg)](https://github.com/Botspot/pi-apps)
[![Unofficial Debian repository](https://img.shields.io/endpoint?url=https%3A%2F%2Frunkit.io%2Fspacingbat3%2Fwebcord-debian-badge%2Fbranches%2Fmaster)](https://itai-nelken.github.io/Webcord_debian-repo/)
</div>

<!-- ———————————————————————————————————————————————————————————————————————————————— -->

A Discord web-based client made with the [Electron API](https://github.com/electron/electron),
developed with [Electron Forge](https://github.com/electron-userland/electron-forge).

WebCord tries to enchance a little more user privacy by allowing the user to block any
third-party website by overwritting website CSP header to the one configured via the settings.
It also blocks some unnecesary services as well, like [Sentry](https://sentry.io).

WebCord takes a differend approach from most clients, as it isn't just a mod of the official
client nor does it use the Discord API to be functional – it is currently based on the web
version of the Discord, which makes it more trusted solution in my opinion. As it even fakes
the user agent to make it equal or similar to the one used by Chrome/Chromium, it is hard to
detect it and block users from using it.

It began as a fork of the [Discord-Electron](https://github.com/GyozaGuy/Discord-Electron),
but then eventually I had rewritten it as *Electron Discord Web App* project, which is
currently called *WebCord* (to make that horribly long name a bit shorter 😉). However
because [@GyozaGuy](https://github.com/GyozaGuy) made his own project, I learnt much about
Electron and how to implement a Discord client with it by analyzing his code. Thanks to his work,
this project could begin on its own.

## Documentation:
- [List of WebCord's features](Features.md)
- [Frequently Asked Questions](FAQ.md)
  - *[Which file I should download?](FAQ.md#1-which-file-i-should-download)*
  - *[Content does not load properly...](FAQ.md#2-imagevideocontent-does-not-load-properly-is-there-anything-i-can-do-about-it)*
  - *[How to grant permission to microphone?](FAQ.md#3-how-to-get-a-microphone-permission-for-webcord)*
- [Configuring the application](Settings.md)
  - [Automatically hide menu bar](Settings.md#auto-hide-menu-bar)
  - [Disable tray functionality](Settings.md#disable-tray)
  - [Hide Discord's side bar](Settings.md#hide-side-bar)
  - [About CSP settings](Settings.md#content-security-policy-settings)
  - [Command line flags](Settings.md#cli-flags)
- [Contributing](Contributing.md)
  - [Run from the sources](Contributing.md#run)
  - [Creating the distributables](Contributing.md#creating-distributables)
  - [Packaging the application](Contributing.md#packaging)
- [Translations](Translate.md)
- [Supported platforms](Support.md)
- [License](../LICENSE)
- [Privacy policy](Privacy.md)

## License
This project is redistributed under the **[MIT License](../LICENSE)**:

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

<div align=right>

<sub> This is <strong> not </strong> the copyright notice nor the full license. </sub> <br>
<sub> <a href='../LICENSE'> Click here </a> to display an actual license. </sub>

</div>

## Want to contribute to my project?

- If you want to improve my code, make a Pull Request and add yourself to the 
  list of contributors in `main.ts`.

- If you want to translate strings in `lang` folder, please visit
  [TRANSLATE.md](Translate.md).

Never made a pull request before? Please refer to [this website](https://makeapullrequest.com/).
