## Information about supported platforms

### GNU/Linux

This is the current platform that I'm developing my application for.
It is fully supported by me, no matter for what architecture or on what
Linux distribution you're installing my application – both ARM and X86 computers
are supported. Please note that Electron deprecates the 32-bit X86 architecture,
so the support for it may be dropped by me as well.

### Windows

This is yet another platform to which I may give some attention to as I'm able
to test how my application works on it. It's support might still not be as great
as on Linux, but I'll give my best to fix most or all issues that are specific
to it.

### MacOS

Because I don't own any macOS device, I am not able to provide the official
support to this platform. That doesn't mean that app won't work on the macOS at
all – I will provide the binaries for it and try to make my software at least
usable for the macOS computers by not writing any platform-specific code that
could cause the incompatibility with the Apple devices. However, I may not fix
any of the reported issues that I won't be able to reproduce on other platforms.

### `musl` `libc` based Linux distributions

Unfortunately, there's no official Electron release built under `musl` `libc`,
although it might be possible to compile it, at least for some Electron
releases. See [`electron/electron #9662`][issue9662] for further details.

Some Linux distibutions seem to provide Electron packages and in that case, it
should be possible to run WebCord on them without any issues. Moreover you could
even try to extract or repackage the Electron from these distributions to any
other `musl` `libc` based Linux distribution if you want to. Currently,
[Void Linux `x86-64` seem to provide a release for it][void-electron].

### FreeBSD

Currently Electron isn't officially supported on FreeBSD (see
[`electron/electron #3797`][issue3797]). However, a community provides the
[prebuilt Electron binaries for `x64` FreeBSD operating system][freebsd], which
should be functional with WebCord. And because FreeBSD uses similar libraries as
Linux, WebCord's code does not include any `process.platform === "linux"` checks
and rather than this prefers to exclude the presence of some platforms that are
supported by the Electron and don't support Linux APIs (i.e. Windows and macOS).
This way, a compatibility with FreeBSD as well as with other BSD-based
distributions or even with other *nix operating systems that are not part of BSD
operating system family.

WebCord has been confirmed to work in the past with FreeBSD by me (author of
this project). It shouldn't break but if it does, I may or may not work on any
fix for it. But as long as provided Electron builds runs correctly, WebCord on
FreeBSD should share most of its bugs with Linux.

After you install a specific Electron package (e.g. `electron19`), you can
extract `app.asar` from any distributable (most likely from Windows or Linux
ones) and run it in terminal with installed system-wide Electron:
```sh
electron$v $path
```
*(Replace `$v` and `$path` with actual version number and path to the extracted*
*`app.asar`.)*

## Supported enviroments

### *nix on Wayland

Currently, Wayland support is hit or miss and it is going to be greatly
dependant on sofware bugs within Electron/Chromium or `xdg-desktop-portals`
implementations (in case of screen share) or some kind of inconsistences.
Moreover, many browsers run in XWayland by the default – in both Chromium and
Firefox, native Wayland seems to be treated as an experimental feature and you
will have to opt-in for it either via command-line flags or some kind of hidden,
*advanced* configuration like `chrome://flags` or `about:config`. The same is
with WebCord: you will have to put any flag that enables Wayland on Chromium
like `--ozone-platform=wayland`, `--ozone-hint=auto` or `--ozone-hint=wayland`.
The first one is going to be recommended since it also enables some integrations
done in WebCord (two other flags might be supported as well in WebCord `3.8.5`
or newer).

So, while on upstream Wayland support varies, on WebCord side however I believe
I did the most I could for it to work well on Wayland. Unlike many Electron
apps, mine does integrate well with native portals and `PipeWireCapturer` for
screen sharing on Wayland and XWayland (i.e. X11 with `XDG_SESSION=wayland` or
`WAYLAND_DESKTOP` env being set to any value) by the default. I've also
implemented some code for accelerated VA-API decoding / encoding and for
automatically enabling OpenGL or GLES when the user has opted-in for
experimental flags (which is broken on non-NVidia desktops, at least until
`3.8.5` gets released).



[repo]: https://github.com/SpacingBat3/WebCord "GitHub: SpacingBat3/WebCord"
[issue3797]: https://github.com/electron/electron/issues/3797 "Add FreeBSD support to electron • Issue #3797 • electron/electron"
[issue9662]: https://github.com/electron/electron/issues/9662 "musl libc support • Issue #9662 • electron/electron"
[freebsd]: https://github.com/tagattie/FreeBSD-Electron/releases "Releases • FreeBSD-Electron: Electron port for FreeBSD"
[void-electron]: https://voidlinux.org/packages/?arch=x86_64-musl&q=electron "Electron query search in Void Linux package list."