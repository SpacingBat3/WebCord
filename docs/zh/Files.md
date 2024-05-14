# 源代码树
WebCord包含许多源代码和资产，用于其各自的功能——这可能会导致开发者感到困惑，他们不知道应该在哪里放置他们的代码，以及在哪里找到特定功能的部分。

## 顶级目录和配置文件

WebCord的本地仓库通常具有以下顶级文件夹：

- `sources` – 这是WebCord仓库最重要的部分，因为它包含所有源代码文件和资产（包括编译成JavaScript的代码）。

- `docs` – 这是本文档所在的位置。它可能包含不同语言版本的文档翻译的子文件夹。

- `node_modules` – 这是NPM生成的文件夹，用于存储WebCord的依赖项。它不应被推送到远程仓库，但如果出于某种原因它在那里，请尽快创建一个新的问题。

- `out` – 这个文件夹包含打包的WebCord版本及其*分发物*（即Debian的`*.deb`，Fedora的`*.rpm`，Linux通用的`*.AppImage`和Windows和MacOS的`*.zip`）。

此外，您还可以在WebCord仓库的副本中找到这些顶级文件：

- `package.json` – 这个文件包含`npm`和`electron`使用的元数据，如WebCord的依赖项、主脚本路径、Forge配置路径，甚至是*WebCord就是WebCord*。

- `package-lock.json` – `npm`生成的文件，用于锁定依赖项到各种版本。由于WebCord在主版本中的发布模型倾向于始终使用尽可能多的更新的依赖项版本，大多数依赖项没有锁定，并且出于这个原因没有将锁定文件发布到仓库中（如果您想更改这一点，请查看`.gitignore`）。

- `yarn.lock` – 类似于`package-lock.json`的锁定文件，但它由`yarn`包管理器使用。

- `tsconfig.json` – 包含元数据的JSON with Comments配置文件。

- `.eslintrc.json` – 一个linter配置（ESLint）。

## `sources`文件夹内的目录和文件

为了使代码浏览更加容易，代码和资产根据其类型分组在以下文件夹中：

- `code` – 包含TypeScript格式的应用程序代码。由于WebCord的代码现在已经相当大，代码被分离到不同文件中的以下文件夹：

  - `main` – 包含WebCord特定的代码部分，不能被任何其他软件在不做代码修改的情况下重用。

  - `modules` – 包括以这样一种方式制作的脚本，它们可以被不同的软件在不做任何代码修改的情况下重用。将来，我将把它们托管在Node.js注册表上，允许其他人在他们自己的软件中将它们作为模块使用。

  - `build` – 包含与构建配置相关的脚本的文件夹；目前它仅用于Electron Forge（`forge.ts`）。

- `assets` – 包含作为WebCord软件一部分的所有资产。此文件夹中的资产按以下子文件夹分组：
  
  - `icons` – 包含WebCord使用的所有图标（包括应用程序图标和托盘图标）。

  - `translations` – 包含对WebCord制作的官方翻译的目录。

  - `web` – HTML内部网页及其内容（CSS/JSON文件）的文件夹，由WebCord使用。

- `app` – 包含编译成JavaScript语言的应用程序代码，删除了注释以节省一些空间。我不建议您弄乱这些文件，因为它们无论如何都会被`tsc`覆盖，除非您想找出TypeScript在编译期间是否搞砸了什么（这不太可能发生，至少对于稳定的特性是这样）。它与`code`文件夹具有相同的结构。

## 包含WebCord代码的源文件

自初始发布以来，WebCord已经发生了巨大变化，其代码变得太大，无法在单个文件中舒适地开发。这也需要命名方案。因此，总的来说，WebCord的源代码文件是根据以下命名方案命名并放置在文件夹中的：
```
{processOrBuild}/[type]/{functionality}.ts
```

- `{processOrBuild}`指示这个脚本属于哪个进程。WebCord目前包含三个代表该文件夹的文件夹：`main`、`renderer`和`global`（适用于属于多个进程的脚本）。该规则的例外是`build`目录，其中包含WebCord的Electron Forge构建配置。

- `[type]`子文件夹按其目的对代码进行分组。它可以意味着与`BrowserWindows`相关的脚本（`windows`）、窗口的`preload`s或依赖于其他脚本的`modules`。还有一些不属于这些类别的脚本——它们直接放在适当的`{process}`文件夹中。

- `{functionality}`直接显示这个脚本实现的功能。例如，`about.ts`表示实现*关于*窗口功能的脚本。

以下是对上述内容的更详细描述：

---

### 跨进程脚本（`global/`）：

  - `main.ts` – 主要负责从其他文件加载代码的其他部分，并将它们组合成一个程序的脚本。它还处理命令行标志（由于某些标志作为应用程序的独立部分工作）并实现为创建的`webContents`的默认属性（主要是为了加强应用程序的安全性）。

  - `global.ts` – 包含在多个进程（即主进程和渲染器进程脚本）之间使用的简单模块声明的脚本。

---

### 与窗口相关的脚本：

#### 窗口声明（`main/windows/`）：

  - `about.ts` – 定义*关于*窗口，显示有关应用程序本身（版本、贡献者、许可证等）的信息。

  - `docs.ts` – 定义WebCord的文档浏览器，使用[`marked`](https://www.npmjs.com/package/marked)引擎进行markdown渲染。

  - `main.ts` – 包含WebCord主窗口的声明，即包含Discord界面的窗口。

  - `settings.ts` – 用于WebCord新的基于HTML的配置面板的窗口定义。

#### 窗口特定的`preload`脚本（`renderer/preload/`）：

  - `main.ts` – `mainWindow`的预加载脚本，基本上加载了下面几节中描述的`capturer.ts`和`cosmetic.ts`脚本。

  - `settings.ts` – WebCord设置管理器的前端脚本；它通过IPC通信以从网站加载和获取配置。

  - `docs.ts` – 提供WebCord的markdown文档阅读器的功能。

  - `about.ts` – 负责根据翻译文件和预定义的HTML文件结构加载*关于*窗口的内容。

  - `capturer.ts` – 与屏幕捕获BrowserView通信，显示窗口列表，并将选定的源通过IPC发送回Discord。

---

### 应用程序模块（`*/modules/`）：

#### 跨进程模块（`global/modules/`）：

  - `user.ts` – 一个模拟WebCord的用户代理的模块，通过使用当前Electron版本中的Chromium引擎版本生成它。

  - `l10n.ts` – 定义WebCord中的本地化支持。

  - `package.ts` – 包含用于加载和验证`package.json`文件的类和函数。一旦它被设计为支持所有`package.json`属性，根据[NPM文档](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)，它可能会在未来发布在WebCord的源代码之外（作为一个独立的NPM包）。

#### 渲染器进程模块（`renderer/modules/`）

  - `capturer.ts` – 使用IPC向`main.ts`发送请求并等待它响应选定的源。

  - `cosmetic.ts` – 对Discord网站进行一些美化更改，删除其中一些不必要的内容，如应用程序下载弹出窗口。

#### 主进程模块（`main/modules/`）：

  - `bug.ts` – 一个生成新GitHub问题URL的模块，该URL是一个预填了一些Electron可用的操作系统详细信息的`bug`模板的URL。当前（截至WebCord）的实现

  - `error.ts` – 处理`uncaughtException`s，允许在某些情况下进行更漂亮的输出，以及显示错误消息和简化的错误栈的`dialog` GUI窗口。

  - `menus.ts` – 包括声明各种（OS原生）菜单的模块，以及一些通过它调用的功能的实现。

  - `config.ts` – 包含用于读取和修改WebCord中各种配置文件的类和类型。

  - `csp.ts` – 定义内容安全策略信息，将由WebCord用于覆盖原始CSP标头，允许阻止一些对Discord工作不必要的第三方网站。
    
  - `client.ts` – 包含WebCord主进程中一些全局使用的属性。它包含一些在`package.json`中不可用的元数据，如Discord网站的URL。

  - `update.ts` – 用于实现WebCord中更新通知功能的模块。

---

### 构建配置（即Electron Forge）：

  - `build/forge.ts` – 包含应用程序的Electron Forge配置。
  
  - `build/forge.d.ts` – 包括Electron Forge配置的类型定义。
