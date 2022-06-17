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
[![GitHub downloads][badge2]](https://github.com/SpacingBat3/WebCord/releases "Releases")
[![Build][badge3]](https://github.com/SpacingBat3/WebCord/actions/workflows/build.yml "Build state")
[![Pi-Apps badge][badge4]](https://github.com/Botspot/pi-apps "An app center with open source software for Raspberry Pi OS")
[![Pi-Ware badge][badge6]](https://github.com/piware14/pi-ware "An alternative store to Pi-Apps.")
[![Unofficial Debian repository][badge5]](https://itai-nelken.github.io/Webcord_debian-repo/ "Unofficial Debian repository")
</div>

A Discord and [Fosscord] *API-less* client made with the [Electron][electron].

The main reason for the existence of WebCord has previously been to create a usable ARM
alternative, but nowadays it's development is more focused on making it a *more open*
alternative to the Discord client, which would be both customisable and
improving in some aspects like security and privacy. As for now, some tweaks
around privacy has been implemented:

  - blocking third-party websites via customisable CSP,
  - blocking unnecessary services and tracers with custom CSP, like [Sentry],
  - blocking known Discord tracing API requests (`/science` and `/tracing`)
    by the default,
  - optionally blocking typing indicator (`/typing`).
  
Please note many features I have plans for haven't been implemented yet – you can
find more about that [in this file](Features.md).

WebCord takes a different approach from most clients, as it isn't just a mod of
the official client nor does it use the Discord API to be functional – it is
currently based on the web version of the Discord, trying to protect the users
from being detected as third-party client. It also does a bit more to hide all
changes it made:

  - Chrome/Chromium user-agent spoofing (Discord treats WebCord as the regular
    browser),

  - spoofing some functions modifications as native (so Discord should treat
    them same way as they wouldn't be touched by WebCord),

  - hiding the content over removing it (so it can't be simply detected by
    watching the changes to the HTML code; Discord would need to also watch for
    the changes within the each of the elements style to detect client designed
    like that).

This project at first was a fork of the [Discord-Electron], but then eventually
I had rewritten it as *Electron Discord Web App* project, which is currently
called *WebCord* (to make that horribly long name a bit shorter 😉). However,
because [@GyozaGuy](https://github.com/GyozaGuy) made his own project, I learnt
much about Electron and how to implement a Discord client with it by analysing
his code. Thanks to his work, this project could begin on its own.

## Documentation:

For newcomers I recommend to read at least the [FAQ](FAQ.md) (to fix common issues and not report them as *bugs*). 
You may also read [Features](Features.md) to know which features have been implemented and are supported. 
It is strongly advised to read the [application license](../LICENSE) as well.

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

Because **GitHub Wiki Pages** of this project **are meant to be maintained by**
**the community**, they should be considered as a potentially malicious or
misleading source of the information. It is recommended to read the official
documentation first before you will proceed reading the community-maintained
Wiki pages.

## License
This project is redistributed under the terms of **[MIT License][license]**:

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

Please take a look at [`Contributing.md`](./Contributing.md) – it describes more
about ways of giving your help to improve quality of WebCord. And for some tasks
you don't even need to be familiar with programming at all!

[badge1]: https://img.shields.io/github/package-json/dependency-version/SpacingBat3/WebCord/dev/electron?color=%236CB2BF&label=Electron
[badge2]: https://img.shields.io/github/downloads/SpacingBat3/WebCord/total.svg?label=Downloads&color=%236586B3
[badge3]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Build&logo=github
[badge4]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-sypgxsowx4mj.runkit.sh%2F
[badge5]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-debian-badge-toklg87kjpyo.runkit.sh%2F
[badge6]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-sypgxsowx4mj.runkit.sh%2F%3Fbadge%3Dpi-ware&logo=data:image/png;base64,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
[Sentry]: https://sentry.io "Application Monitoring and Error Tracking Software"
[Discord-Electron]: https://github.com/GyozaGuy/Discord-Electron "An Electron Discord app designed for use on Linux systems."
[npm-docs]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors "People Fields | NPM Documentation"
[makepr]: https://makeapullrequest.com/ "Make a Pull Request"
[electron]: https://www.electronjs.org/ "Build cross-platform desktop apps with JavaScript, HTML, and CSS."
[electron-forge]: https://www.electronforge.io/ "A complete tool for creating, publishing, and installing modern Electron applications."
[license]: ../LICENSE "WebCord license"
[Fosscord]: https://fosscord.com "Free, open source and selfhostable Discord compatible chat, voice and video platform."
