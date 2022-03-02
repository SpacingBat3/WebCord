# Frequently asked questions
Because many people that are Linux novices or Windows/MacOS users has many
issues even installing my app, I decided to write a short FAQ answering many
questions that I saw on Discord or issues.

## 1. Which file I should download?

If you have a trouble identifying which file you should install on your
platform, here's the full list of platforms and recommended distributable names,
grouped in tables by platforms:

<div align=center>

### Windows

| <div align=center> Architecture </div> | <div align=center> Archive name </div> |
| :------------------------------------- | :------------------------------------- |
| 64-bit (Intel/AMD)                     | `webcord-win32-x64-{version}.zip`      |
| 32-bit (Intel/AMD)                     | `webcord-win32-ia32-{version}.zip`     |
| 64-bit ARM                             | `webcord-win32-arm64-{version}.zip`    |

### macOS

| <div align=center> Architecture </div> | <div align=center> Archive name </div> |
| :------------------------------------- | :------------------------------------- |
| 64-bit X86 (Regular Mac computers)     | `webcord-darwin-x64-{version}.zip`     |
| 64-bit ARM (Apple M1 computers)        | `webcord-darwin-arm64-{version}.zip`   |

### Linux

| <div align=center> Distributions </div>     | <div align=center> Recommended package </div>       |
| :------------------------------------------ | :-------------------------------------------------- |
| Debian / Ubuntu 64-bit (AMD or Intel)       | `webcord_{version}_amd64.deb`                       |
| Debian / Ubuntu 32-bit (AMD or Intel)*      | `webcord_{version}_i386.deb`                        |
| Debian / Ubuntu ARM 64-bit                  | `webcord_{version}_arm64.deb`                       |
| Debian / Ubuntu ARM 32-bit                  | `webcord_{version}_armhf.deb`                       |
| Arch Linux / Manjaro (any architecture)     | [Arch User Repository (Official)](https://aur.archlinux.org/packages/webcord-git/) |
| Fedora / Red Hat Linux 64-bit (Intel / AMD) | `webcord-{version}.x86_64.rpm`                      |
| Fedora / Red Hat Linux 32-bit (Intel / AMD)*| `webcord-{version}.i386.rpm`                        |
| Fedora / Red Hat Linux ARM 64-bit           | `webcord-{version}.arm64.rpm`                       |
| Fedora / Red Hat Linux ARM 32-bit           | `webcord-{version}.armv7hl.rpm`                     |
| Linux 64-bit (Intel / AMD) distributions    | `webcord-{version}-x64.AppImage`                    |
| Linux 32-bit (Intel / AMD) distributions*   | `webcord-{version}-ia32.AppImage`                   |
| Linux ARM 64-bit distributions              | `webcord-{version}-arm64.AppImage`                  |
| Linux ARM 32-bit distributions              | `webcord-{version}-armv7l.AppImage`                 |

<div align='right'><sup>* Platforms deprecated by Electron. </sup></div></div>

### 2. Image/video/content does not load properly, is there anything I can do about it?
Yes, this is probably an issue due to Content Security Policy header not
including all URLs that are allowed to load. You can disable it [in Settings](./Settings.md)
as a workaround.

### 3. How to get a microphone permission for WebCord?
If you granted it via the application settings, this warning may indicate a
wrong configuration in your system audio settings – for some reason, Electron
doesn't seems to get access to microphone when there's no default / fallback
device set. To fix it, set your microphone as default/fallback in your system's
audio settings and restart the application – make sure it's properly closed and
there's no icon in tray nor Electron/WebCord process running in the background!

Currently, this bug could be encountered on Linux, it's state is unknown for the
other platforms.

### 4. Why Electron?

I've seen a long discussion about Electron being criticized and even through
I don't find it a perfect software, I think it is the best for me currently as
for the web-based software development – it is designed to be secure while
connecting to the internet sites, unlike some other solutions. It is also the
only solution that I've found to support the ARM devices. Electron is an easy
solution for the beginners that just can't develop each app for each platform
and maintain it, it is just more time-consuming to maintain the application for
multiple platforms because of different libraries used for an GUI interface.
For instance, if I would like to rewrite WebCord for the GTK3/4 WebView with
`node-gtk`, I would have to use different API for Windows since `node-gtk` does
not work currently on Windows platforms. For people thinking that QT could be a
solution for native implementation, I don't think that QT always integrates
well with every theme or can be easily themed.

As of the alternatives that are close to the Electron, the only software that
seemed to be promising as of the switching was NW.js, yet it is more designed
for rendering the local sites and does not take the security approach the same
way as Electron, making me to care more about developing the code which wouldn't
leak too much access to the system files to the sites.

Please also take note that my philosophy to design WebCord was to make no use
of the Discord API, to make it safe from being easily detected as unofficial
Discord client and/or taking at risks the users, which could be treated as
self-bots when using some parts of the API reserved only for bots purpose.
And even today, I discourage making the requests, maybe the safest approach
would be to make the client analyse the requests made by site first to make the
list of safe API endpoints or to actually catch the requests made by the Discord
website and expose them to the client to some functionalities.

Also, you can actually reuse the Electron binaries across different applications
– in fact, some Linux distributions like Arch Linux does that for most of the
Electron-based applications that does not depend on any specific Electron
version/binary. This practise will save the disk space and other resources,
since there's no need to run simultaneously multiple Electron binaries with 
different Chromium engine versions.