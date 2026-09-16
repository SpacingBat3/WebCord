# Frequently asked questions

Because many people that are Linux novices or Windows/MacOS users has many
issues even installing my app, I decided to write a short FAQ answering many
questions that I saw on Discord or issues.

## 1. Which file I should download?

If you have a trouble identifying which file you should install on your
platform, here's below the full list of platforms and recommended distributable names,
grouped in tables by platforms. Note if you have older CPUs that are built upon
32-bit architecture (very unlikely), you might not be able to use recent WebCord
prebuilt releases (since Electron v44 and WebCord v5).

<div align=center>

### Windows

| <div align=center> Architecture </div> | <div align=center> Archive name </div> |
| :------------------------------------- | :------------------------------------- |
| Intel/AMD                              | `webcord-win32-x64-{version}.zip`      |
| ARM (Snapdragon X etc.)                | `webcord-win32-arm64-{version}.zip`    |

### macOS

| <div align=center> Architecture </div> | <div align=center> Archive name </div> |
| :------------------------------------- | :------------------------------------- |
| Intel/AMD                              | `WebCord-{version}-x64.dmg`            |
| ARM (Apple sillicon)                   | `WebCord-{version}-arm64.dmg`          |

### Linux

| <div align=center> Distributions </div>     | <div align=center> Recommended package </div>       |
| :------------------------------------------ | :-------------------------------------------------- |
| Debian / Ubuntu Intel/AMD                   | `webcord_{version}_amd64.deb`                       |
| Debian / Ubuntu ARM                         | `webcord_{version}_arm64.deb`                       |
| Arch Linux / Manjaro (any architecture)     | [Arch User Repository (Official)](https://aur.archlinux.org/packages/webcord-git/) |
| Fedora / Red Hat Linux Intel/AMD            | `webcord-{version}.x86_64.rpm`                      |
| Fedora / Red Hat Linux ARM                  | `webcord-{version}.arm64.rpm`                       |
| Linux Intel/AMD distributions               | `webcord-{version}-x64.AppImage`                    |
| Linux ARM distributions                     | `webcord-{version}-arm64.AppImage`                  |

There's also a list of community-maintained WebCord packages in [`Repos.md`].

## 2. Image/video/content does not load properly, is there anything I can do about it?

What you are encountering is most likely an issue due to Content Security Policy
header not including all URLs that are allowed to load. You can disable it in WebCord
settings as a workaround.

## 3. How to get a microphone/camera/?? working in WebCord?

WebCord externally manages permissions to various Discord elements – and blocks
permissions that are not explicitly enabled. This means if something like
camera or microphone is not detected and Discord tells you that it needs
permissions, it is very likely it is blocked by WebCord.

For some permissions, WebCord should gently prompt you for access to the given
resources – but if for some reason you did not encounter the prompt dialog,
you might grant (or deny) permissions via settings, found in menu bar.

## 4. Why Electron?

Electron, unlike rummours, isn't exactly the worst development platform for
cross-platform applications – and with how it evolves, it still remains one
of the most api-rich sollutions for developing a desktop applications that
can nicely integrate with your OS. Additionally, Electron is what Discord uses
by themselves, which helps considerably with feature parity and stability of
web apis that Discord might use. Unified browser engine ecosystem is also
beneficial, to offer better platform-independent ecosystem and support the
same complex APIs that WebCord utilizes – not all browser engines are capable
of as much as Chromium in Electron (this is especially to consider for
Webkit).

While TypeScript/JavaScript might feel like a bottleneck for desktop
applications, it offers a rich api to work with, is relatively friendly to
anyone interested in messing with WebCord's codebase and integrates well with
Web APIs. Additionally, asynchronous code execution can be expressed in quite
straightforward way and offer quite benefits to performance. And unlike to
rumours, JS is far from being a single-threaded, especially in context of
Electron software.

In general, it feels like Electron is the most straightforward framework not
just for me but anyone who wants to work with, build, package and distribute
WebCord, although I still keep my eyes on alternative technology and consider
to work with something else.

## 5. Is this project violating Discord's Terms of Service?

At the current state, it modifies the style of the page via CSS injection and
tweaks the JavaScript, so I believe **yes**. However, I focus in WebCord on
spoofing and hiding all modifications done in way Discord can't be sure what and
how modifications were done (e.g. stylesheets are injected without HTML, so they
can't be programmatically caught via `MutationObserver`), so even when WebCord
does any modifications, including injecting custom stylesheets, **you should be safe**.

In my eyes, WebCord is the last client from which you should expect to be banned
by violating the Discord's Terms of Service. I see more risk at using clients
that directly sends requests to Discord via API, where it could be easy to
detect abnormal requests that can be send by clients, especially when the API
version got bumped at official client, or official client mods, which usually
don't hide the fact they modify something and even sometimes does use directly
the API without informing the user about it.

[`Repos.md`]: ./Repos.md "List of community-maintained software repositories providing WebCord."
