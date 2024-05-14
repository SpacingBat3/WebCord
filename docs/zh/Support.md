## 支持的平台信息

### GNU/Linux

这是我正在为我的应用开发当前平台的地方。
无论您在什么架构或Linux发行版上安装我的应用程序，它都完全受到我的支持——无论是ARM还是X86计算机都受到支持。请注意，Electron弃用了32位X86架构，因此我也可能放弃对它的支持。

### Windows

这是我可能给予一些关注并能够测试我的应用程序在该平台上的工作情况的另一个平台。它的支持可能仍然不如Linux上的支持那么好，但我将尽力修复特定于Windows的大多数或所有问题。

### MacOS

因为我没有任何macOS设备，我无法为这个平台提供官方支持。这并不意味着应用程序在macOS上根本不起作用——我将为其提供二进制文件，并尝试通过不编写任何可能导致与苹果设备不兼容的平台特定代码，至少使软件在macOS计算机上可用。然而，我可能不会修复任何我无法在其他平台上重现的报告问题。

### 基于`musl` `libc`的Linux发行版

不幸的是，没有官方的Electron版本是在`musl` `libc`下构建的，尽管可能可以编译它，至少对于某些Electron版本是这样。有关更多详细信息，请参阅[`electron/electron #9662`][issue9662]。

一些Linux发行版似乎提供了Electron软件包，如果是这种情况，那么应该可以在它们上面无问题地运行WebCord。此外，您甚至可以尝试从这些发行版提取或重新打包Electron，以适用于任何其他基于`musl` `libc`的Linux发行版，如果您愿意的话。目前，[Void Linux `x86-64`似乎为其提供了一个版本][void-electron]。

### FreeBSD

目前Electron在FreeBSD上并不受官方支持（见[`electron/electron #3797`][issue3797]）。然而，社区提供了[适用于`x64` FreeBSD操作系统的预构建Electron二进制文件][freebsd]，这些文件应该与WebCord兼容。由于FreeBSD使用的库与Linux类似，WebCord的代码不包含任何`process.platform === "linux"`检查，而是更喜欢排除一些由Electron支持且不支持Linux API的平台（即Windows和macOS）的存在。这样，WebCord与FreeBSD以及其他基于BSD的发行版，甚至与BSD操作系统家族以外的其他*nix操作系统的兼容性。

WebCord过去已经被我这个项目的作者在FreeBSD上确认过可以工作。它应该不会破坏，但如果它确实破坏了，我可能会也可能不会为其工作在任何修复上。但只要提供的Electron构建运行正确，FreeBSD上的WebCord应该与Linux共享大多数错误。

在您安装了特定的Electron软件包（例如`electron19`）之后，您可以从任何分发版（最有可能来自Windows或Linux）中提取`app.asar`，并在安装了系统范围的Electron的终端中运行它：
```sh
electron$v $path
```
*（将`$v`和`$path`替换为实际的版本号和提取的*
*`app.asar`的路径。）*

## 支持的环境

### Wayland上的*nix

目前，Wayland的支持情况参差不齐，这将极大地依赖于Electron/Chromium或`xdg-desktop-portals`实现（在屏幕共享的情况下）中的软件错误，或一些不一致性。此外，许多浏览器默认在XWayland上运行——在Chromium和Firefox中，原生Wayland似乎被视为一个实验性功能，您将不得不通过命令行标志或一些隐藏的、*高级*配置来选择加入它，如`chrome://flags`或`about:config`。WebCord也是如此：您将不得不放置任何启用Chromium上Wayland的标志，如`--ozone-platform=wayland`、`--ozone-hint=auto`或`--ozone-hint=wayland`。第一个将被推荐，因为它还启用了WebCord中完成的一些集成（其他两个标志在WebCord `3.8.5`或更新版本中也可能得到支持）。

因此，虽然上游Wayland支持各不相同，但在WebCord方面，然而，我相信我做了我能做的最多的事情，使其在Wayland上工作得很好。与许多Electron应用程序不同，它与原生门户和Wayland和XWayland上的`PipeWireCapturer`进行屏幕共享（即X11，带有`XDG_SESSION=wayland`或`WAYLAND_DESKTOP`环境被设置为任何值）默认集成得很好。我还实现了一些代码，用于加速VA-API解码/编码，并在用户选择实验标志时自动启用OpenGL或GLES（这在非Nvidia桌面上至少在`3.8.5`发布之前是破坏的）。

[repo]: https://github.com/SpacingBat3/WebCord  "GitHub: SpacingBat3/WebCord"
[issue3797]: https://github.com/electron/electron/issues/3797  "Add FreeBSD support to electron • Issue #3797 • electron/electron"
[issue9662]: https://github.com/electron/electron/issues/9662  "musl libc support • Issue #9662 • electron/electron"
[freebsd]: https://github.com/tagattie/FreeBSD-Electron/releases  "Releases • FreeBSD-Electron: Electron port for FreeBSD"
[void-electron]: https://voidlinux.org/packages/?arch=x86_64-musl&q=electron  "Electron query search in Void Linux package list."
