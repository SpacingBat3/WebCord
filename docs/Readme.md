<table class="alert-warn" align=center>
<tr>
    <td> ⚠️ </td>
    <td>
        WebCord development goes temporarily into <b>the maintenance-only mode</b>.
        This is to show that any abnormal lack of activity isn't going to mean it is
        no longer maintained. See https://github.com/SpacingBat3/WebCord/discussions/260
        for more details how this might affect WebCord development and when I plan to
        end this.
    </td>
</tr>
</table>
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

[![CodeQL][codeql-badge]][codeql-url] [![Build][build-badge]][build-url]
[![Weblate badge][l10nbadge]][l10n] [![GitHub downloads][dlbadge]][downloads]
[![Discord server][discord-badge]][discord-url]

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

WebCord cares a lot about your security. Being fully written in TypeScript, it
brings the power of static types to help detecting common bugs without the need
of testing the app at runtime. All of this is hardened by ESLint, which forbidds
some TypeScript practises like the use of `any` type and enforces some cosmetic
aspects of the code to keep it more consistent.

Unlike to official Discord client, WebCord's policy about Electron also makes it
to use the latest major release currently supported and available at the package
time. This makes WebCord use more up-to-date Electron releases with more recent
Chromium engine.

Built on top Electron and Chromium, WebCord's security is also highly dependant
from Chrome's [vulnerability rewards program][chromiumbounty], which is probably
one of the most known programs like this when comparing to different popular
browser engines choices. Electron is also well-prepared for loading remote
content, using their process model to the advantage and different Chromium
sandboxing techniques to split Node.js from browser scripts. WebCord also tries
its best to follow practises from the [Electron#Security].

- 🛠️ **Customizable**

WebCord can be configured to your needs and the preferences – you can harden it
even more by blocking unnecesarry third-party websites in Content Security
Policy settings, improve your privacy by blocking typing indicator and much more!
Moreover, a support for custom stylesheets is on its way, allowing you to theme
WebCord the way you like!

- 📱 **ARM-friendly and Linux mobile support**

Although Electron is not designed to work on mobile devices, WebCord tries its
best to be responsive even on devices with the smaller screens and touch
screens. It's still not ideal, but should work for basic Discord usage. However
I plan to focus on it someday and to make it look and work closer to the
official Discord Android client.

## Documentation:

For newcomers I recommend to read at least the [FAQ](FAQ.md) (to fix common issues and not report them as *bugs*). 
You may also read [Features](Features.md) to know which features have been implemented and are supported. 
It is strongly advised to read the [application license](../LICENSE) as well.

- [List of WebCord's features](Features.md)
- [Community maintained repositories providing WebCord](Repos.md)
- [Frequently Asked Questions](FAQ.md)
  - *[Which file I should download?](FAQ.md#1-which-file-i-should-download)*
  - *[Content does not load properly...](FAQ.md#2-imagevideocontent-does-not-load-properly-is-there-anything-i-can-do-about-it)*
  - *[How to grant permission to microphone?](FAQ.md#3-how-to-get-a-microphone-permission-for-webcord)*
  - *[Why Electron?](FAQ.md#4-why-electron)*
  - *[What about ToS?](FAQ.md#5-is-this-project-violating-discords-terms-of-service)*
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

[dlbadge]: https://img.shields.io/github/downloads/SpacingBat3/WebCord/total.svg?label=Downloads&color=%236586B3
[downloads]: https://github.com/SpacingBat3/WebCord/releases "Releases"
[build-badge]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Build&logo=github
[build-url]: https://github.com/SpacingBat3/WebCord/actions/workflows/build.yml "Build state"
[l10nbadge]: https://hosted.weblate.org/widgets/webcord/-/svg-badge.svg
[l10n]: https://hosted.weblate.org/engage/webcord/ "Help at WebCord's localization"
[Sentry]: https://sentry.io "Application Monitoring and Error Tracking Software"
[Discord-Electron]: https://github.com/GyozaGuy/Discord-Electron "An Electron Discord app designed for use on Linux systems."
[npm-docs]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors "People Fields | NPM Documentation"
[electron]: https://www.electronjs.org/ "Build cross-platform desktop apps with JavaScript, HTML, and CSS."
[electron-forge]: https://www.electronforge.io/ "A complete tool for creating, publishing, and installing modern Electron applications."
[license]: ../LICENSE "WebCord license"
[Fosscord]: https://fosscord.com "Free, open source and selfhostable Discord compatible chat, voice and video platform."
[discordapi]: https://discord.com/developers/docs/reference "Official Discord REST API documentation"
[chromiumbounty]: https://bughunters.google.com/about/rules/5745167867576320/chrome-vulnerability-reward-program-rules "Chrome Vulnerability Reward Program Rules"
[Electron#Security]: https://www.electronjs.org/docs/latest/tutorial/security "Security | Electron Documentation"
[codeql-badge]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/CodeQL?label=Analysis&logo=github&logoColor=white
[codeql-url]: https://github.com/SpacingBat3/WebCord/actions/workflows/codeql-analysis.yml "CodeQL Analysis status"
[discord-badge]: https://img.shields.io/discord/972965161721811026?color=%2349a4d3&label=Support&logo=discord&logoColor=white
[discord-url]: https://discord.gg/aw7WbDMua5 "Official support server on Discord!"
