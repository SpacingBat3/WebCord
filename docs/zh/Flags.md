# 命令行（运行时）标志

WebCord能够解析一些Chromium标志和以下特定于应用程序的标志：

- **`--start-minimized` 或 `-m`** – 在托盘中最小化启动WebCord；在系统启动时运行WebCord时很有用；

- **`--version` 或 `-V`** – 显示应用程序版本并在*应用程序准备好之前*退出。

- **`--help`, `-?` 或 `-h`** – 显示有关应用程序的帮助信息。

- **`--export-l10n={dir}`** – 将当前加载的翻译导出为一组JSON文件到**`{dir}`**目录。

- **`--verbose` 或 `-v`** – 显示调试消息。

- **`--gpu-info=basic|complete`** – 以JavaScript对象的形式显示Chromium的原始GPU信息。

# 构建标志：

## 1. 在Electron Forge中

在使用Electron Forge打包应用程序时，WebCord支持以下构建环境变量来设置构建特定标志：

- `WEBCORD_BUILD={release,stable,devel}` – 如果设置为`release`或`stable`，WebCord将被构建为稳定版本，其中一些实验性功能将被禁用，这些功能不适用于生产构建。默认构建类型为`devel`。

- `WEBCORD_ASAR={true,false}` – 如果设置为`false`，WebCord将不会被打包到`asar`归档中。默认为`true`。

- `WEBCORD_UPDATE_NOTIFICATIONS={true,false}` – 如果设置为`false`，新更新将不会显示通知；此功能旨在供包维护者使用，以便他们可以为用户禁用通知，并让包管理器处理更新通知。

- `WEBCORD_WIN32_APPID=[string]` *(仅限Windows)* – 替换`ApplicationUserModelID`，用作唯一的应用程序标识符。默认为`SpacingBat3.WebCord`。如果您想要区分您的构建与官方构建，例如，如果您要发布自己的Windows WebCord包，并带有您自己的补丁，并希望允许它与官方WebCord可执行文件共存，则应将其替换。

- `WEBCORD_FLATPAK_ID=[string]` *(仅限Linux)* – 在Flatpak清单文件中用作唯一的应用程序标识符。对于社区构建，应将其设置为其他内容。默认为`io.github.spacingbat3.webcord`

## 2. 其他工具

如果您自己打包应用程序，您可以直接创建一个`buildInfo.json`文件，该文件由WebCord内部使用以确定构建环境标志的状态（除了`asar`打包，这是您需要使用自己的Electron打包软件实现或配置的）。
`buildInfo.json`文件应放置在应用程序的根目录中（即与`package.json`相邻）并包含以下属性：

- `"type": "devel"/"release"` – 类似于`WEBCORD_BUILD`，这控制此构建是否用于生产用途或开发目的。如果未设置，WebCord的构建类型将设置为`devel`。

- `"commit": [hash]` – 这个属性将保存有关构建提交的信息；对于`release`构建类型，它将被忽略。

- `AppUserModelId: [string]` *(仅限Windows)* – 定义WebCord构建的`ApplicationUserModelId`，这在Windows分发物中应该始终存在。

- `"features": [Object]` – 这是控制一些特性的对象；目前它可以包含这些可选属性：

  - `"updateNotifications": true/false` – 是否在新版本发布时显示通知；这不禁用更新检查器在控制台打印其当前状态（即如果版本过时）。
