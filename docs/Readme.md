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

A Discord web-based client made with the [Electron API][electron], developed
with [Electron Forge][electron-forge].

The main reason of the WebCord existence was previously creating a usable ARM
alternative, but nowadays it's developement is more around making it *more open*
alternative to WebCord, which would be both customizable and improving in some
aspects like the security and privacy. As for now, some tweaks around the
privacy has been implemented:
  - blocking third-party websites via customizable CSP.
  - blocking unnecesary services and tracers with custom CSP, like [Sentry][sentry].
  
Please note many features I have plans for hasn't been still implemented yet –
you can find more about that [in the official documentation](Features.md).

WebCord takes a differend approach from most clients, as it isn't just a mod of
the official client nor does it use the Discord API to be functional – it is
currently based on the web version of the Discord, which makes it more trusted
solution in my opinion. As it even fakes the user agent to make it equal or
similar to the one used by Chrome/Chromium, it is hard to detect it and block
users from using it.

It began as a fork of the [Discord-Electron][discord-electron], but then
eventually I had rewritten it as *Electron Discord Web App* project, which is
currently called *WebCord* (to make that horribly long name a bit shorter 😉).
However, because [@GyozaGuy](https://github.com/GyozaGuy) made his own project,
I learnt much about Electron and how to implement a Discord client with it by
analyzing his code. Thanks to his work, this project could begin on its own.

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
- [Translations](Translate.md)
- [Supported platforms](Support.md)
- [License](../LICENSE)
- [Privacy policy](Privacy.md)

## Wiki pages

Because **Github Wiki Pages** of this project **are maintained by the community**,
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

<div align=right>
<sub>

Please note that [LICENSE][license] file is an actual license of this software. \
It takes precedence over the text displayed above.

</sub>
</div>

## Want to contribute to my project?

- If you want to improve my code, make a Pull Request and add yourself to the 
  [`contributors`][npm-docs] array in `package.json`.

- If you want to translate strings in `lang` folder, please visit
  [TRANSLATE.md](Translate.md).

Never made a pull request before? Please refer to [this website][makepr].

[badge1]: https://img.shields.io/github/package-json/dependency-version/SpacingBat3/WebCord/dev/electron?color=%236CB2BF&label=Electron
[badge2]: https://img.shields.io/github/downloads/SpacingBat3/electron-discord-webapp/total.svg?label=Downloads&color=%236586B3
[badge3]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Build&logo=github
[badge4]: https://badgen.net/badge/Pi-Apps%3F/Yes!/c51a4a?icon=https://raw.githubusercontent.com/Botspot/pi-apps/master/icons/vector/logo.svg
[badge5]: https://img.shields.io/endpoint?url=https%3A%2F%2Frunkit.io%2Fspacingbat3%2Fwebcord-debian-badge%2Fbranches%2Fmaster
[sentry]: https://sentry.io "Application Monitoring and Error Tracking Software"
[discord-electron]: https://github.com/GyozaGuy/Discord-Electron "An Electron Discord app designed for use on Linux systems."
[npm-docs]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors "People Fields | NPM Documentation"
[makepr]: https://makeapullrequest.com/ "Make a Pull Request"
[electron]: https://www.electronjs.org/ "Build cross-platform desktop apps with JavaScript, HTML, and CSS."
[electron-forge]: https://www.electronforge.io/ "A complete tool for creating, publishing, and installing modern Electron applications."
[license]: ../LICENSE "WebCord license"