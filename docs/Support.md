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

### FreeBSD

Currently Electron isn't officially supported on FreeBSD (see
[`electron/electron #3797`][issue3797]).

Electron was previously available in `freshports`, but now there're no Electron
14+ releases here, so it doesn't seem to be maintained here anymore. There's also
[a GitHub repository][freebsd-repo] that seems to provide recent Electron
binaries for FreeBSD, although I'm unsure whenever they're working fine with
WebCord or not – you can use them at your own responsibility.

If you want to run WebCord under FreeBSD's Electron binary, you can install it
(or extract it somewhere), clone WebCord's source code, install dependencies and
compile it with `tsc` as described in [Build.md](Build.md) and run `electron`
with WebCord's source code directory as the parameter:
```sh
electron "/path/to/WebCord/"
```

[repo]: https://github.com/SpacingBat3/WebCord "GitHub: SpacingBat3/WebCord"
[issue3797]: https://github.com/electron/electron/issues/3797 "Add FreeBSD support to electron • Issue #3797 • electron/electron"
[issue9662]: https://github.com/electron/electron/issues/9662 "musl libc support • Issue #9662 • electron/electron"
[freebsd-repo]: https://github.com/tagattie/FreeBSD-Electron/releases "Releases • FreeBSD-Electron: Electron port for FreeBSD"