# 常见问题解答
由于许多Linux新手或Windows/MacOS用户甚至在安装我的应用程序时都遇到很多问题，我决定编写一个简短的FAQ，回答我在Discord上看到的问题或问题。

## 1. 我应该下载哪个文件？

如果您在确定应该在您的平台上安装哪个文件时遇到困难，这里是按平台分组的完整平台列表和推荐的分发名称列表：

<div align=center>

### Windows

| <div align=center> 架构 </div> | <div align=center> 存档名称 </div> |
| :------------------------------------- | :------------------------------------- |
| 64位 (Intel/AMD)                     | `webcord-win32-x64-{version}.zip`      |
| 32位 (Intel/AMD)                     | `webcord-win32-ia32-{version}.zip`     |
| 64位 ARM                             | `webcord-win32-arm64-{version}.zip`    |

### macOS

| <div align=center> 架构 </div> | <div align=center> 存档名称 </div> |
| :------------------------------------- | :------------------------------------- |
| 64位 X86 (常规Mac电脑)     | `webcord-darwin-x64-{version}.zip`     |
| 64位 ARM (Apple M1电脑)        | `webcord-darwin-arm64-{version}.zip`   |

### Linux

| <div align=center> 发行版 </div>     | <div align=center> 推荐包 </div>       |
| :------------------------------------------ | :-------------------------------------------------- |
| Debian / Ubuntu 64位 (AMD或Intel)       | `webcord_{version}_amd64.deb`                       |
| Debian / Ubuntu 32位 (AMD或Intel)*      | `webcord_{version}_i386.deb`                        |
| Debian / Ubuntu ARM 64位                  | `webcord_{version}_arm64.deb`                       |
| Debian / Ubuntu ARM 32位                  | `webcord_{version}_armhf.deb`                       |
| Arch Linux / Manjaro (任何架构)     | [Arch用户仓库（官方）](https://aur.archlinux.org/packages/webcord-git/)  |
| Fedora / Red Hat Linux 64位 (Intel / AMD) | `webcord-{version}.x86_64.rpm`                      |
| Fedora / Red Hat Linux 32位 (Intel / AMD)*| `webcord-{version}.i386.rpm`                        |
| Fedora / Red Hat Linux ARM 64位           | `webcord-{version}.arm64.rpm`                       |
| Fedora / Red Hat Linux ARM 32位           | `webcord-{version}.armv7hl.rpm`                     |
| Linux 64位 (Intel / AMD) 发行版    | `webcord-{version}-x64.AppImage`                    |
| Linux 32位 (Intel / AMD) 发行版*   | `webcord-{version}-ia32.AppImage`                   |
| Linux ARM 64位 发行版              | `webcord-{version}-arm64.AppImage`                  |
| Linux ARM 32位 发行版              | `webcord-{version}-armv7l.AppImage`                 |

<div align='right'><sup>* 被Electron弃用的平台。 </sup></div></div>

在[`Repos.md`]中还有社区维护的WebCord包的列表。

## 2. 图片/视频/内容加载不正确，我能做些什么吗？
是的，这可能是由于内容安全策略头没有包含所有允许加载的URL的问题。你可以在WebCord设置中禁用它作为一个解决方案。

## 3. 如何为WebCord获取麦克风权限？
如果您通过应用程序设置授予了权限，这个警告可能表明您的系统音频设置中配置错误——由于某些原因，当没有默认/回退设备设置时，Electron似乎无法访问麦克风。要解决这个问题，请在您的系统音频设置中将您的麦克风设置为默认/回退，并重新启动应用程序——确保它已正确关闭，并且托盘中没有图标，也没有Electron/WebCord进程在后台运行！

目前，这个bug可能在Linux上遇到，其他平台的状态未知。

## 4. 为什么选择Electron？

我看到了很多关于Electron的批评性讨论，尽管我认为它不是完美的软件，但我认为它目前对我来说是最好的，因为对于基于Web的软件开发——它旨在在连接到互联网站点时保持安全，与其他一些解决方案不同。它也是我发现的唯一支持ARM设备解决方案。对于无法为每个平台开发每个应用程序并维护它的初学者来说，Electron是一个简单的解决方案，它只是维护多平台应用程序更加耗时，因为不同的GUI界面使用了不同的库。例如，如果我想使用`node-gtk`为GTK3/4 WebView重写WebCord，我将不得不在Windows上使用不同的API，因为`node-gtk`目前在Windows平台上不起作用。对于认为QT可以作为本地实现解决方案的人来说，我不认为QT总是与每个主题很好地集成（即*它非常丑陋！*）或者可以轻松主题化。

截至接近Electron的替代品，唯一似乎有希望的软件是NW.js，但它更多地设计用于渲染本地站点，并且不会像Electron那样采取相同的安全方法，这让我更担心开发代码，以免泄露太多对系统文件的访问权限给站点。

请注意，我设计WebCord的哲学是不使用Discord API，使其免于被轻易检测为非官方Discord客户端和/或冒险用户，这些用户在使用API的某些部分时可能被视为自机器人。即使在今天，我仍然不鼓励进行请求，也许最安全的方法将是让客户端首先分析站点所做的请求，以制作安全API端点列表，或者实际上捕获Discord网站所做的请求，并将它们暴露给客户端的某些功能。

此外，你实际上可以在不同的应用程序中重用Electron二进制文件——实际上，一些Linux发行版，如Arch Linux，对于大多数不依赖任何特定Electron版本/二进制的基于Electron的应用程序都是这样做的。这种做法将节省磁盘空间和其他资源，因为没有必要同时运行多个具有不同Chromium引擎版本的Electron二进制文件。

## 5. 这个项目是否违反了Discord的服务条款？

在当前状态下，它通过CSS注入和JavaScript调整修改了页面的风格，所以我相信**是的**。然而，我专注于WebCord在隐藏所有修改方面进行欺骗，Discord无法确定做了什么以及如何进行修改（例如，样式表是在没有HTML的情况下注入的，因此它们无法通过`MutationObserver`以编程方式捕获），所以即使WebCord进行了任何修改，包括注入自定义样式表，**你应该都是安全的**。

在我看来，WebCord是您应该期望因违反Discord的服务条款而被禁止使用的最后一个客户端。我认为使用直接通过API向Discord发送请求的客户端存在更大的风险，因为可以很容易地检测到这些客户端发送的异常请求，特别是当官方客户端的API版本升级，或者官方客户端修改通常不隐藏它们修改的事实，甚至有时在不通知用户的情况下直接使用API。

[`Repos.md`]: ./Repos.md "提供WebCord的社区维护软件仓库列表。"
