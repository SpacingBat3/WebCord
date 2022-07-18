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

[![Build][badge2]][badge2url] [![Weblate badge][badge6]][badge6url]
[![GitHub downloads][badge1]][badge1url] [![Pi-Apps badge][badge3]][pi-apps]
[![Pi-Ware badge][badge5]][pi-ware] [![Unofficial APT repository][badge4]][debian-repo]


A Discord and [Fosscord] client implemented directly without [Discord API][discordapi].
Made in 🇵🇱 with the [Electron][electron] framework.

</div>

## Philosophy / key features

Nowadays, WebCord is quite complex project; it can be summarized as a pack of
security and privacy hardenings, Discord features reimplementations, Electron /
Chromium / Discord bugs workarounds, stylesheets, internal pages and wrapped
<https://discord.com> page, designed to conform with ToS as much as it is
possible (or hide the changes that might violate it from Discord's eyes). For
all features, take a look at [Features.md](Features.md).

 - 🕵️ **Hardened for privacy**

WebCord does a lot to improve the privacy of the users. It blocks known tracing
and fingerprinting methods, but it does not end on it. It also manages the
permissions to sensitive APIs like camera or microphone, sets its own user agent
to the one present in Chromium browsers and spoof web API modifications in order
to prevent distinguishing it from the real Chrome/Chromium browsers.

- 🛡️ **Follows the best security practises**

Built on Electron and Chromium, WebCord is consistently secure on all platforms
and does not depend on *native* browser engines' security. Moreover Chrome (and
because of this – Chromium) has a good [vulnerability rewards program][chromiumbounty],
which is **probably** one of the most popular programs from all of the browsers.
It should also be said Electron does care about the remote content security – it
has a complex process model which sandboxes (at least) the browser scripts from
Node.js. And with the restrictive TypeScript and ESlint policy, most simple bugs
in the code, including those affecting the app security, are eliminated even
before they will go into the production. WebCord also tries to follow practises
from the [Electron#Security] page, validating the pages using the local list
rather than the one remotely fetched from the Discord. It has also a few
securities known from the browsers, like an `alert`/`prompt` dialog spam
prevention in case Discord would begin to behave maliciously.

- 🛠️ **Customizable**

WebCord can be configured to your needs and the preferences – you can harden it
even more by blocking unnecesarry third-party websites in Content Security
Policy settings, improve your privacy by blocking typing indicator and much more!
Moreover, a support for custom stylesheets is on its way, allowing you to theme
WebCord the way you like!

- 📱 **ARM-friendly and Linux mobile support**

Altrough Electron is not designed to work on mobile devices, WebCord tries its
best to be responsive even on devices with the smaller screens and touch
screens. It's still not ideal, but should work for basic Discord usage. However
I plan to focus on it someday and to make it look and work closer to the
official Discord Android client.

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

## History

At first, this project was a fork of the [Discord-Electron], but then eventually
I had rewritten it as *Electron Discord Web App* project, which is currently
called *WebCord*.

At its early days, it had a very simple concept: a better web app implementation
than Nativefier was, at least in terms of the features. Since I were too young
to understand how to keep things private and secure, this project's code was
full of flaws. It was like that until `1.x.y`, when the privacy and the security
of the code has slowly been shaping, with `1.2.0` being a major step forward,
since TypeScript was started to being adopted. Later, I've added the default
linter to the project's documentation and configured the rules for it and
focused on child window design, which added the *documentation*, *settings* and
*about* windows to the Discord page. I've then also realized there's a serious issue with the current screen share
dialog – it was injected to the page, meaing Discord could technically access
the windows' thumbnails and *simulate* the mouse click events to trigger sharing
the screen even without any interaction. This flaw was thankfully fixed thanks
to the BrowserViews in more modern WebCord releases.

With the code quality, a new philosophies and goals has shaped for this project
– it now approaches to wrap Discord website and develop its own UI (todo) for
non-Discord instances primarly based on the Discord API (might decide some
day that WebCord will also support other APIs as well). With that, I want to
reimplement Discord in a way it is a trully FOSS client, without any risk that
users will get banned by either breaking the ToS or being detected as self-bot
because of the suspicious use of Discord REST API. This is what WebCord mainly
focuses to achieve nowadays.

And it should be said that before I knew much about how Electron does work,
[**@GyozaGuy**](https://github.com/GyozaGuy)'s project help me to begin on my
own with developing a Discord webapp. Without his work, it is unknown whenever I
would begin developing WebCord or not.

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

[badge1]: https://img.shields.io/github/downloads/SpacingBat3/WebCord/total.svg?label=Downloads&color=%236586B3
[badge1url]: https://github.com/SpacingBat3/WebCord/releases "Releases"
[badge2]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Build&logo=github
[badge2url]: https://github.com/SpacingBat3/WebCord/actions/workflows/build.yml "Build state"
[badge3]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-sypgxsowx4mj.runkit.sh%2F
[pi-apps]: https://github.com/Botspot/pi-apps "An app center with open source software for Raspberry Pi OS. (GitHub)"
[badge4]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-debian-badge-toklg87kjpyo.runkit.sh%2F
[pi-ware]: https://github.com/piware14/pi-ware "An alternative store to Pi-Apps. (GitHub)"
[badge5]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-sypgxsowx4mj.runkit.sh%2F%3Fbadge%3Dpi-ware&logo=data:image/png;base64,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
[debian-repo]: https://itai-nelken.github.io/Webcord_debian-repo/ "Unofficial Debian repository (Homepage)"
[badge6]: https://hosted.weblate.org/widgets/webcord/-/svg-badge.svg
[badge6url]: https://hosted.weblate.org/engage/webcord/ "Help at WebCord's localization"
[Sentry]: https://sentry.io "Application Monitoring and Error Tracking Software"
[Discord-Electron]: https://github.com/GyozaGuy/Discord-Electron "An Electron Discord app designed for use on Linux systems."
[npm-docs]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors "People Fields | NPM Documentation"
[makepr]: https://makeapullrequest.com/ "Make a Pull Request"
[electron]: https://www.electronjs.org/ "Build cross-platform desktop apps with JavaScript, HTML, and CSS."
[electron-forge]: https://www.electronforge.io/ "A complete tool for creating, publishing, and installing modern Electron applications."
[license]: ../LICENSE "WebCord license"
[Fosscord]: https://fosscord.com "Free, open source and selfhostable Discord compatible chat, voice and video platform."
[discordapi]: https://discord.com/developers/docs/reference "Official Discord REST API documentation"
[chromiumbounty]: https://bughunters.google.com/about/rules/5745167867576320/chrome-vulnerability-reward-program-rules "Chrome Vulnerability Reward Program Rules"
[Electron#Security]: https://www.electronjs.org/docs/latest/tutorial/security "Security | Electron Documentation"