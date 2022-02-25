## List of currently implemented (and planned) Webcord's features

Because WebCord is based on Discord Website and (unlike official client and
client mods) does not use any of the Discord's propertiary Node.js C++ native
modules nor fake itself as an official Discord client (but rather as a Chromium
browser), it has similar features and limitations like Discord Web application.
However, WebCord client is capable of doing some tweaks to it, implementing
following list of the features:

| Name | Description | State / Notes |
| --- | --- | --- |
| Tray icon | Hiding aplication in the tray. | ✅️ Done |
| Red badge (tray) | Display indicator at DM or mentions on tray icon. | ✅️ Done |
| Custom CSP | Allow users to modify CSP to block unnecesarry websites. | ✅️ Done |
| Flash window on mentions | Flash window button to visually indicate mentions or DMs even with tray disabled. | ✅️ Done |
| Custom dictonary languages | Customize the language set used for the autocompletition feature | ❌️ **TODO** |
| Translations | WebCord's localization support for multiple languages. | 2️⃣️ ***Beta*** |
| Hiding the Discord's side bar | Switching the visibility state of side bar containing channel list. This makes WebCord working on the devices with the smaller screens, like e.g. PinePhone smartphones. | ✅️ Done |
| Node.js-based WebCord extensions support | WebCord-specific addon implementation that allows for using Node dependencies. | ⚠️ **Will do** |
| Chromium-based extensions support | Chromium browser addon support. | 1️⃣ ***Alpha*** (experimental implementation) |
| Addon permisions management | Limits the permissions of the extensions for the security reasons. | ❌️ **TODO** |
| Global shortcut for push-to-talk | Makes the shortcut for PTT globally available. | ❌️ **TODO** |
| Block `/science` and `/tracing` API endpoints | Implement blocking of some known tracing methods in Discord. | ✅️ Done |
| Block `/typing` API endpoint | Optionally block typing indicator. | ✅️ Done |
| End-to-end message encryption. | Allow to encrypt the message in the box before it is send. | ❌️ **TODO** |
| HTML-based settings menu | Web-based settings menu instead of GTK (menubar) ones. | 2️⃣ ***Beta*** (it's actively improved) |
| `--version` / `-v` command-line flag | Prints application version to the console instead of running it. | ✅️ Done |
| `--start-minized` / `-m` command-line flag | Starts application minimized in the tray. | ✅️ Done |
| WebCord update notifications | Notifies the user whenever new WebCord version is out | ✅️ Done |
| Bug report generation | Automatically generates bug report based on the OS configuration | ✅️ Done |
| `buildInfo.json` | Implement generating and parsing a JSON configuration file that contains the release information and build flags. | ✅️ Done | 
| In-app documentation browser | Built-in Markdown reader for offline documentation files. | ✅️ Done |
| Splash screen on load | Display animated splash screen before loading Discord. | ✅️ Done |
| Permission management | Lets you dedide what Discord can do and what it can't. | ✅️ Done |
| Custom Discord instances | Allows to use different Discord instances, e.g. Fosscord. | 1️⃣ ***Alpha*** |
| Hide download buttons/popups | Hide elements reffering to official Discord client download link | ✅️ Done |
| HTML-based *about* panel | Non-native window showing the information about the application, like licenses, versions or credits. | 2️⃣ ***Beta*** (it's actively improved) |
| Custom Discord and WebCord styles | Allow styling Discord and WebCord with own themes. | 1️⃣ ***Alpha*** (Discord can be styled) |


<sub> **NOTE:** Please report bugs for the features listed above. If your issue
describes a feature that is not on the list, you may consider opening a
**feature request**. If some of the implemented app's features are missing
there, feel free to inform me about that in the *Issues* or *Discussions*. If
you are talented enough, you could also implement them yourself and do a Pull
Request. </sub>

### State legend:
 
 - ❌️ **TODO** – this feature **may** or **may not** be implemented in the future.
   It's in *concept* state – there's nothing implemented about it and it might not
   be implemented soon, even if it is ever planned to be done.

-  ⚠️ **Will do** – there's nothing implemented in code about this feature, but it
   is planned as a next feature to be worked on.

 - 1️⃣ ***Alpha*** – the work on implementing this feature has already begun, but
   it's still far from being finished.
 
 - ️2️⃣️ ***Beta*** – this feature has been mostly implemented, but it still needs
   to be polished before being marked as *done*. This indicates that this
   feature will be actively worked on to adapt it for the new changes, find a
   better implementation and so on.

 - ✅️ **Done** – this feature has been fully implemented and there's no need to
   actively work on it.
 
 - ⛔️ **Broken** – this feature has been working, but it recently stopped
   working either due to some Discord and/or WebCord updates.

 - 🚧️ ***Under construction*** – A major rewrite around this feature is in
   progress to improve it.

---

### Experimental features

Here are some notes about the features that are still not visibly implemented
and are far from being called *user-friendly*. Things are meant here to be
broken, so don't expect you will be able to use them as you intent to.

#### 1. Custom Discord Styles

From version `3.0.0`, WebCord is capable of styling Discord pages, yet the
implementation is still very limited and most of existing themes are not
functional yet.

You can apply themes by creating a file in `{userData}/Themes/{theme name}/index.css`
as for now.

#### 2. Chromium Extensions

From version `3.0.0`, an experimenal Chromium extensions support has been
implemented using Electron's [Chrome Extension Support][chrome-ext]. As Electron's
implementation of Chromium extensions is far from the one in Chromium, a lot of
the extensions may not be fully functional or not work at all.

You can load Chromium extensions by extracting them from `.crx` archive to
`{userData}/Extensions/Chromium/{extension name}/` folder.

[chrome-ext]: https://www.electronjs.org/docs/latest/api/extensions "Chrome Extension Support | Electron's online documentation"