## List of currently implemented (and planned) Webcord's features

Because WebCord is based on Discord Website and (unlike official client and
client mods) does not use any of the Discord's propertiary Node.js C++ native
modules nor fake itself as an official Discord client (but rather as a Chromium
browser), it has similar features and limitations like Discord Web application.
However, WebCord client is capable of doing some tweaks to it, implementing
following list of the features:

| Name | Description | State |
| --- | --- | --- |
| Tray icon | Hiding aplication in the tray. | ✔️ Done |
| Red badge (tray) | Display indicator at DM or mentions on tray icon. | ✔️ Done |
| Custom CSP | Allow users to modify CSP to block unnecesarry websites. | ✔️ Done |
| Translations | WebCord's localization support for multiple languages. | ✔️ Done |
| Hiding the Discord's side bar | Switching the visibility state of side bar containing channel list. This makes WebCord working on the devices with the smaller screens, like e.g. PinePhone smartphones. | ⛔️ Broken (since v2.0.0-beta1) |
| Node.js-based WebCord extensions support | WebCord-specific addon implementation that allows for using Node dependencies. | ⚠️ ***Alpha*** (works for *developers*) |
| Chromium-based extensions support | Chromium browser addon support. | ⚠️ ***Alpha*** (does not work) |
| Addon permisions management | Limits the permissions of the extensions for the security reasons. | ❌️ **TODO** |
| Global shortcut for push-to-talk | Makes the shortcut for PTT globally available. | ❌️ **TODO** |
| HTML-based settings menu | Web-based settings menu instead of GTK (menubar) ones. | ⚠️ ***Beta*** |
| `--version` / `-v` command-line flag | Prints application version to the console instead of running it. | ✔️ Done |
| `--start-minized` / `-m` command-line flag | Starts application minimized in the tray. | ✔️ Done |
| WebCord update notifications | Notifies the user whenever new WebCord version is out | ✔️ Done |
| Bug report generation | Automatically generates bug report based on the OS configuration | ✔️ Done |
| Automatic bug reporting on crash | Asks user if he wants to report a bug and opens the URL to the new GitHub issue in the default browser. | ❌️ **TODO** |
| In app documentation browser | Built-in Markdown reader for documentation files. | ⚠️ **Will Do** |
| ~~Easter Eggs~~ | You've seen nothing! | N/A?



<sub> **NOTE:** Please report bugs for the features listed above. If your issue
describes a feature that is not on the list, you may consider opening a
**feature request**. If some of the implemented app's features are missing
there, feel free to inform me about that in the *Issues* or *Discussions*. If
you wish to you could also add them yourself and do a Pull Request. </sub>

### State legend:
 
 - ❌️ **TODO** – this feature **may** or **may not** be implemented in the future.

 - ⚠️ **Will Do** – there's nothing implemented in code about this feature, but it
   is planned as a next feature to be worked on.

 - ⚠️ ***Alpha*** – the work on implementing this feature has already begun, but
   it's still far from being finished.
 
 - ⚠️ ***Beta*** – this feature has been mostly implemented and minior fixes are
   needed to be made before pushing it to the releases. 
 
 - ✔️ **Done** – this feature has been fully implemented.
 
 - ⛔️ **Broken** – this feature has been working, but it recently stopped
   working either due to some Discord and/or WebCord updates.
 
 - **N/A** – either there's not known state for this feature or its state cannot
   be described with phrases listed above.
