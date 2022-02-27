<p align='right'><sub>
  Znasz 🇵🇱? Przejdź <a href='pl/Readme.md' title='Polski plik README'>tutaj</a>.
</sub></p>
<div align='center'>
<a href='https://github.com/SpacingBat3/WebCord' title="WebCord's GitHub Repository">
  <picture>
    <source srcset='https://raw.githubusercontent.com/SpacingBat3/WebCord/master/sources/assets/icons/app.png'>
    <img src='../sources/assets/icons/app.png' height='192' alt="WebCord Logo">
  </picture>
</a>

<!-- BEGIN Readable part of the Readme file. -->

# WebCord

[![Electron][badge1]][electron]
[![Github downloads][badge2]](https://github.com/SpacingBat3/WebCord/releases "Releases")
[![Build][badge3]](https://github.com/SpacingBat3/WebCord/actions/workflows/build.yml "Build state")
[![Pi-Apps badge][badge4]](https://github.com/Botspot/pi-apps "An app center with open source software for Raspberry Pi OS")
[![Unofficial Debian repository][badge5]](https://itai-nelken.github.io/Webcord_debian-repo/ "Unofficial Debian repository")
</div>

A Discord and [Fosscord] web-based client made with the [Electron API][electron],
developed with [Electron Forge][electron-forge].

The main reason of the WebCord existence was previously creating a usable ARM
alternative, but nowadays it's developement is more around making it *more open*
alternative to the Discord client, which would be both customizable and improving in some
aspects like the security and privacy. As for now, some tweaks around 
privacy has been implemented:

  - Blocking third-party websites via customizable CSP. \
  - Blocking unnecesary services and tracers with custom CSP, like [Sentry]. \
  - Blocking known Discord tracing API requests (`/science` and `/tracing`)
    by the default. \
  - Optionally blocking typing indicator (`/typing`).
  
Please note that many of the features I have plans for, haven't been implemented yet –
you can find more about that [in this file](Features.md).

WebCord takes a differend approach from most clients, as it isn't just a mod of
the official client nor does it use the Discord API to be functional – it is
currently based on the web version of the Discord, trying to protect the users
from being detected as third-party client. It also does a bit more to hide all the
changes it makes:

  - Chrome/Chromium user-agent spoofing (Discord treats WebCord as the regular
    browser). \

  - Spoofing some functions modifications as native (so Discord will treat the
    same way as it wouldn't be touched by WebCord). \

  - Hiding the content over removing it (so it can't be simply detected by
    watching the changes to the HTML code; Discord would need to also watch for
    the changes within the each of the elements style to detect client designed
    like that).

This project at first was a fork of the [Discord-Electron], but then eventually
I had rewritten it as *Electron Discord Web App* project, which is currently
called *WebCord* (to make that horribly long name a bit shorter 😉). However,
because [@GyozaGuy](https://github.com/GyozaGuy) made his own project, I learnt
much about Electron and how to implement a Discord client with it by analyzing
his code. Thanks to his work, this project could begin on its own.

## Documentation:
- [List of WebCord's features](Features.md)
- [Frequently Asked Questions](FAQ.md)
  - *[Which file I should download?](FAQ.md#1-which-file-i-should-download)*
  - *[Content does not load properly...](FAQ.md#2-imagevideocontent-does-not-load-properly-is-there-anything-i-can-do-about-it)*
  - *[How to grant permission to microphone?](FAQ.md#3-how-to-get-a-microphone-permission-for-webcord)*
  - *[Why Electron?](FAQ.md#4-why-electron)*
- [Command line / build flags](Flags.md)
  - [Command line (runtime) flags](Flags.md#command-line-runtime-flags)
  - [Build Flags](Flags.md#build-flags)
- [Contributing in the application development](Contributing.md)
- [Building, packaging and testing the source code](Build.md)
  - [Installing app dependencies](Build.md#install-app-dependencies)
  - [Compiling and directly running the code](Build.md#compile-code-and-run-app-directly-without-packaging)
  - [Linting and validating the code](Build.md#run-linter-and-validate-the-code)
  - [Packaging and creating the distributables](Build.md#packaging-creating-distributables)
- [Source code directory structure](Files.md)
- [Translations](Translate.md)
- [Supported platforms](Support.md)
- [License](../LICENSE)
- [Privacy policy](Privacy.md)

## Wiki pages

Because **Github Wiki Pages** of this project **is maintained by the community**,
they should be considered as a potentially malicious or misleading source of the
information. It is recommended to read the official documentation first before
you will proceed reading the community-maintained Wiki pages.

## License
This project is redistributed under the **[MIT License][license]**:

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

## Want to contribute to my project?

- If you want to improve my code, make a Pull Request and add yourself to the 
  [`contributors`][npm-docs] array in `package.json`.

- If you want to translate strings in `lang` folder, please visit
  [TRANSLATE.md](Translate.md).

Never made a pull request before? Please refer to [this website][makepr].

[badge1]: https://img.shields.io/github/package-json/dependency-version/SpacingBat3/WebCord/dev/electron?color=%236CB2BF&label=Electron
[badge2]: https://img.shields.io/github/downloads/SpacingBat3/WebCord/total.svg?label=Downloads&color=%236586B3
[badge3]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Build&logo=github
[badge4]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-sypgxsowx4mj.runkit.sh%2F
[badge5]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-debian-badge-toklg87kjpyo.runkit.sh%2F
[Sentry]: https://sentry.io "Application Monitoring and Error Tracking Software"
[Discord-Electron]: https://github.com/GyozaGuy/Discord-Electron "An Electron Discord app designed for use on Linux systems."
[npm-docs]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors "People Fields | NPM Documentation"
[makepr]: https://makeapullrequest.com/ "Make a Pull Request"
[electron]: https://www.electronjs.org/ "Build cross-platform desktop apps with JavaScript, HTML, and CSS."
[electron-forge]: https://www.electronforge.io/ "A complete tool for creating, publishing, and installing modern Electron applications."
[license]: ../LICENSE "WebCord license"
[Fosscord]: https://fosscord.com "Free, open source and selfhostable Discord compatible chat, voice and video platform."
