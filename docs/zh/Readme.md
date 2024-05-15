<table class="alert-warn" align=center>
<tr>
    <td> 🚧️ </td>
    <td>
        <b>客户端正在进行重大重写！</b> 这意味着，围绕WebCord的大多数工作将保持在最低限度——在现有代码之上可能不会有耗时和重大的更新。然而，WebCord仍应收到维护更新，以及不需要投入我太多时间的新功能或改进。
    </td>
    <td>注意</td>
	<td>
		<b>免责声明。</b>这些文档由社区维护，可能已经过时,而且您最好用英语与维护者交流。
	</td>
</tr>
</table>
<p align='right'><sub>
  English<a href='../Readme.md' title='English Readme'>Here</a>。
</sub></p>
<div align='center'>
<a href='https://github.com/SpacingBat3/WebCord'  title="WebCord的GitHub仓库">
  <picture>
    <source srcset='https://raw.githubusercontent.com/SpacingBat3/WebCord/master/sources/assets/icons/app.png'> 
    <img src='../sources/assets/icons/app.png' height='192' alt="WebCord标志">
  </picture>
</a>

<!-- 开始可读部分的Readme文件。 -->

# WebCord

[![CodeQL][codeql-badge]][codeql-url] [![构建][build-badge]][build-url]
[![Weblate徽章][l10nbadge]][l10n] [![GitHub下载][dlbadge]][downloads]
[![Discord服务器][discord-badge]][discord-url]

一个直接实现的Discord和[Spacebar]客户端，没有使用[Discord API][discordapi]。
使用🇵🇱的[Electron][electron]框架制作。

</div>

## 理念 / 主要特点

如今，WebCord是一个相当复杂的项目；它可以被概括为一包安全和隐私加固、Discord功能重新实现、Electron/Chromium/Discord漏洞解决方法、样式表、内部页面和封装的<https://discord.com>页面，旨在尽可能符合服务条款（或者隐藏可能违反它的更改，以避免Discord的注意）。所有功能，请查看[Features.md](Features.md)。

 - 🕵️ **为隐私而加固**

WebCord做了很多工作来提高用户的隐私。它阻止了已知的追踪和指纹识别方法，但这并不是它的终点。它还管理对相机或麦克风等敏感API的权限，将其自己的用户代理设置为Chromium浏览器中出现的一个，并欺骗Web API修改，以防止将其与真实的Chrome/Chromium浏览器区分开来。

- 🛡️ **遵循最佳安全实践**

WebCord非常关心您的安全。它完全用TypeScript编写，带来了静态类型的威力，有助于在不需要在运行时测试应用程序的情况下帮助检测常见错误。所有这些都通过ESLint得到了加强，ESLint禁止了一些TypeScript实践，如使用`any`类型，并强制执行代码的一些外观方面，以保持它的更加一致。

与官方Discord客户端不同，WebCord关于Electron的政策也使其使用当前支持和可用的最新主要版本。这使得WebCord使用更更新的Electron版本，拥有更近期的Chromium引擎。

建立在Electron和Chromium之上，WebCord的安全也高度依赖于Chrome的[vulnerability rewards program][chromiumbounty]，这可能是在比较不同流行浏览器引擎选择时最知名的此类程序之一。Electron也对加载远程内容做好了充分准备，利用它们的进程模型的优势，以及不同的Chromium沙箱技术来分离Node.js和浏览器脚本。WebCord也尽力遵循[Electron#Security]的实践。

- 🛠️ **可定制的**

WebCord可以根据您的需求和偏好进行配置——您可以通过在内容安全策略设置中阻止不必要的第三方网站来进一步加固它，通过阻止输入指示器来提高您的隐私等！此外，对自定义样式表的支持也在路上，允许您按照您喜欢的方式为主题WebCord！

- 📱 **支持ARM和Linux移动设备**

尽管Electron不是为移动设备设计的，WebCord尽力即使在具有较小屏幕和触摸屏的设备上也能响应。虽然还不是理想的，但应该可以用于基本的Discord使用。然而，我计划有一天专注于它，使其外观和工作更接近官方的Discord Android客户端。

## 文档 （部分未提供翻译）：

对于新来者，我建议至少阅读[FAQ](FAQ.md)（以解决常见问题，而不是将它们报告为*错误*）。您也可以阅读[Features](Features.md)以了解哪些功能已经实现并得到支持。强烈建议阅读[应用程序许可证](../LICENSE)。

- [WebCord的功能列表](Features.md)
- [社区维护的提供WebCord的仓库](Repos.md)
- [常见问题](FAQ.md)
  - *[我应该下载哪个文件？](FAQ.md#1-which-file-i-should-download)*
  - *[内容加载不正确...](FAQ.md#2-imagevideocontent-does-not-load-properly-is-there-anything-i-can-do-about-it)*
  - *[如何授权麦克风？](FAQ.md#3-how-to-get-a-microphone-permission-for-webcord)*
  - *[为什么选择Electron？](FAQ.md#4-why-electron)*
  - *[关于服务条款？](FAQ.md#5-is-this-project-violating-discords-terms-of-service)*
- [命令行 / 构建标志](Flags.md)
  - [命令行（运行时）标志](Flags.md#command-line-runtime-flags)
  - [构建标志](Flags.md#build-flags)
- [参与应用程序开发](Contributing.md)
- [构建、打包和测试源代码](Build.md)
  - [安装应用程序依赖项](Build.md#install-app-dependencies)
  - [编译和直接运行代码](Build.md#compile-code-and-run-app-directly-without-packaging)
  - [Linting和验证代码](Build.md#run-linter-and-validate-the-code)
  - [打包和创建分发文件](Build.md#packaging-creating-distributables)
- [源代码目录结构](Files.md)
- [翻译](Contributing.md#how-to-translate-webcord)
- [支持的平台](Support.md)
- [许可证](../LICENSE)
- [隐私政策](Privacy.md)

## 历史

最初，这个项目是[Discord-Electron]的一个分支，但后来最终被我重写为*Electron Discord Web App*项目，现在被称为*WebCord*。

在早期，它有一个非常简单的概念：至少在功能方面，比Nativefier更好的Web应用程序实现。由于我太年轻，无法理解如何保持事物的私密性和安全性，因此这个项目的代码充满了缺陷。它就是这样，直到`1.x.y`，当代码的隐私和安全性逐渐形成，`1.2.0`是一个重大的进步，因为开始采用TypeScript。后来，我为项目文档添加了默认的linter，并为其配置了规则，并专注于子窗口设计，这为Discord页面添加了*文档*、*设置*和*关于*窗口。然后我意识到当前的屏幕共享对话框存在一个严重问题——它被注入到页面中，这意味着Discord技术上可以访问窗口的缩略图并*模拟*鼠标点击事件，即使没有任何交互，也能触发共享屏幕。这个缺陷幸运地在更现代的WebCord版本中通过BrowserViews得到了修复。

随着代码质量、新理念和目标的形成，这个项目——现在它接近于包装Discord网站并为其开发自己的UI（待办事项），主要用于基于Discord API的非Discord实例（可能有一天决定WebCord也支持其他API）。有了这个，我想以一种真正自由和开源软件（FOSS）客户端的方式重新实现Discord，没有任何风险，用户会因为违反服务条款或因可疑地使用Discord REST API而被检测为自机器人而被禁止。这就是WebCord目前主要致力于实现的。

应该说，在我了解Electron的工作原理之前，[**@GyozaGuy**](https://github.com/GyozaGuy)的项目帮助我开始了自己的开发Discord webapp。没有他的工作，我不知道我是否会开始开发WebCord。

## Wiki页面

由于这个项目的**GitHub Wiki页面**打算由社区维护，它们应该被视为潜在的恶意或误导信息来源。建议在阅读社区维护的Wiki页面之前，先阅读官方文档。

## 许可证
本项目根据**[MIT许可证][license]**的条款重新分发：

	特此免费授予任何获得本软件和相关文档文件（以下简称“软件”）副本的人处理软件的权利，包括但不限于使用、复制、修改、合并、出版、分发、再许可和/或出售软件副本的权利，并允许向软件提供的人这样做，但须遵守以下条件：

	上述版权声明和本许可声明应包含在所有软件副本或实质性部分中。

	软件按“原样”提供，不提供任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权的保证。在任何情况下，无论因合同、侵权行为或其他原因，作者或版权持有人均不对任何索赔、损害或其他责任负责，无论是直接的、间接的还是与之相关的，因软件或软件的使用或其他交易而引起的。

## 想要为我的项目做出贡献吗？

请查看[`Contributing.md`](./Contributing.md)——它描述了更多关于如何帮助提高WebCord质量的方法。对于一些任务，您甚至不需要熟悉编程！

[dlbadge]: https://img.shields.io/github/downloads/SpacingBat3/WebCord/total.svg?label=下载&color=%236586B3 
[downloads]: https://github.com/SpacingBat3/WebCord/releases  "发布"
[build-badge]: https://img.shields.io/github/actions/workflow/status/SpacingBat3/WebCord/build.yml?label=构建&logo=github&branch=master&event=push 
[build-url]: https://github.com/SpacingBat3/WebCord/actions/workflows/build.yml  "构建状态"
[l10nbadge]: https://hosted.weblate.org/widgets/webcord/-/svg-badge.svg 
[l10n]: https://hosted.weblate.org/engage/webcord/  "帮助WebCord的本地化"
[Sentry]: https://sentry.io  "应用性能监控和错误跟踪软件"
[Discord-Electron]: https://github.com/GyozaGuy/Discord-Electron  "为Linux系统设计的Electron Discord应用。"
[electron]: https://www.electronjs.org/  "使用JavaScript, HTML和CSS构建跨平台桌面应用。"
[electron-forge]: https://www.electronforge.io/  "创建、发布和安装现代Electron应用程序的完整工具。"
[license]: ../LICENSE "WebCord许可证"
[Spacebar]: https://spacebar.chat  "免费、开源且可自行托管的与Discord兼容的聊天、语音和视频平台。"
[discordapi]: https://discord.com/developers/docs/reference  "官方Discord REST API文档"
[chromiumbounty]: https://bughunters.google.com/about/rules/5745167867576320/chrome-vulnerability-reward-program-rules  "Chrome漏洞奖励计划规则"
[Electron#Security]: https://www.electronjs.org/docs/latest/tutorial/security  "安全 | Electron文档"
[codeql-badge]: https://img.shields.io/github/actions/workflow/status/SpacingBat3/WebCord/codeql-analysis.yml?label=分析&logo=github&logoColor=white&branch=master&event=push 
[codeql-url]: https://github.com/SpacingBat3/WebCord/actions/workflows/codeql-analysis.yml  "CodeQL分析状态"
[discord-badge]: https://img.shields.io/discord/972965161721811026?color=%2349a4d3&label=支持&logo=discord&logoColor=white 
[discord-url]: https://discord.gg/aw7WbDMua5  "Discord上的官方支持服务器！"
