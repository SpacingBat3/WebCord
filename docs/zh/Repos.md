## 社区维护的WebCord仓库

大多数GitHub发布之外的WebCord构建实际上是由社区提供的！

下面的表格包括了已知的仓库及其维护者。

| 名称               | 维护者                  | 平台             | 主页                      | 徽章 (WebCord版本)                           |
| ------------------ | --------------------- | -------------------- | ---------------------------- | ------------------------------------------------- |
| Pi-Apps            | [Botspot]             | RPiOS/Debian (ARM)   | [pi-apps.io][pi-apps-home]   | [![Pi-Apps][pi-apps-badge]][pi-apps]              |
| Pi-Ware            | [oxmc]                | Linux (ARM)          | [pi-ware.ml][pi-ware-home]   | [![Pi-Ware][pi-ware-badge]][pi-ware]              |
| Debian仓库         | [Itai]                | Debian (x86,ARM)     | [itai-nelken.github.io][deb] | [![非官方APT仓库][debian-badge]][deb] |
| Flathub仓库        | [Multiple][fc]        | Linux (x86,ARM)      | [(FlatHub页面)][flathub]    | (无，详见[网站][flathub]以获取版本信息)        |
| Scoop/Extras       | [lukesampson]         | Windows (x86)        | [scoop.sh]                   | (无)                                            |
| AUR/`webcord`      | [Hanabishi]           | Arch Linux (x86,ARM) | [(AUR页面)][src-aur]        | (无，详见[AUR][src-aur]以获取版本信息)          |
| AUR/`webcord-bin`  | [Hanabishi]           | Arch Linux (x86,ARM) | [(AUR页面)][bin-aur]        | (无，详见[AUR][src-aur]以获取版本信息)          |
| CachyOS/`cachyos`  | [CachyOS]             | Arch Linux (x86)     | [cachyos.org][cachyos-repo]  | (无)                                            |
| Raspbian Addons    | [Raspbian Addons][ra] | RPiOS/Debian (ARM)   | [raspbian-addons.org][ra-h]  | (无，详见[仓库][ra-repo]以获取版本信息)   |

<!-- "乱码"下面： -->

[pi-apps]: https://github.com/Botspot/pi-apps  "适用于Raspberry Pi OS的开源软件应用中心。（GitHub）"
[pi-apps-home]: https://pi-apps.io/  "适用于Raspberry Pi OS的开源软件应用中心。（主页）"
[pi-apps-badge]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-a4fc5umlta6t.runkit.sh%2F 
[pi-ware]: https://github.com/piware14/pi-ware  "Pi-Apps的替代商店。（GitHub）"
[pi-ware-home]: https://pi-ware.ml  "Pi-Apps的替代商店。（主页）"
[pi-ware-badge]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-a4fc5umlta6t.runkit.sh%2F%3Fbadge%3Dpi-ware&logo=data:image/png;base64,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 
[debian-badge]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-debian-badge-toklg87kjpyo.runkit.sh%2F 
[deb]: https://itai-nelken.github.io/Webcord_debian-repo/  "非官方Debian仓库（主页）"
[fc]: https://github.com/flathub/io.github.spacingbat3.webcord/graphs/contributors 
[flathub]: https://flathub.org/apps/details/io.github.spacingbat3.webcord  "社区维护的Flathub仓库。"
[src-aur]: https://aur.archlinux.org/packages/webcord  "为'稳定'版本构建的源代码的PKGBUILD。"
[bin-aur]: https://aur.archlinux.org/packages/webcord-bin  "为'稳定'版本重新打包的二进制文件的PKGBUILD。"
[Botspot]: https://github.com/Botspot 
[Itai]: https://github.com/Itai-Nelken 
[oxmc]: https://github.com/oxmc 
[lukesampson]: https://github.com/lukesampson 
[Hanabishi]: https://github.com/HanabishiRecca 
[scoop.sh]: https://scoop.sh/ 
[CachyOS]: https://github.com/CachyOS/  "专注于性能优化并提供一些不被Arch Linux开发者采纳的流行软件包的Arch衍生版。"
[cachyos-repo]: https://wiki.cachyos.org/en/home/Repo  "CachyOS Wiki – 添加仓库"
[ra]: https://github.com/raspbian-addons  "主要为Raspberry Pi计算机提供ARM软件的社区维护APT仓库"
[ra-h]: https://raspbian-addons.org  "Raspbian Addons (主页)"
[ra-repo]: https://apt.raspbian-addons.org/debian/pool/main/w/webcord/  "Raspbian Addons (仓库)"
