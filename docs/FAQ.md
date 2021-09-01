# Frequently asked questions
Because many people that are Linux novices or Windows/MacOS users has many
issues even installing my app, I decided to write a short FAQ answering many
questions that I saw on Discord or issues.

## 1. Which file I should download?

If you have a trouble indentifying which file you should install on your
platform, here's the full list of platforms and recommended distributable names,
grouped in tables by platforms:

<div align=center>

### Windows

| <div align=center> Architecture </div> | <div align=center> Archive name </div> |
| :------------------------------------- | :------------------------------------- |
| 64-bit (Intel/AMD)                     | `webcord-win32-x64-{version}.zip`      |
| 32-bit (Intel/AMD)                     | `webcord-win32-ia32-{version}.zip`     |
| 64-bit ARM                             | `webcord-win32-arm64-{version}.zip`    |

### MacOS

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
You can't, as it is aquired automatically when Discord website asks for it. In
fact, this is rather an issue with your system audio settings – for some reason,
Electron doesn't seems to get access to microphone when there's no default /
fallback device set. To fix it, set your microphone as default/fallback in your
system's audio settings and restart the application – make sure it's properly
closed and there's no icon in tray nor electron/webcord process running in the
background!