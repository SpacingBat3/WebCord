## About the application settings
This section will describe different options found in the "Settings" submenu.

**Note:** currently most settings requires to restart the app to see any effects of chaning them.

### Disable tray

This option will hide application tray, as well as some integrations done for it. It is meant to be used on the Linux distributions, desktop enviroments or with any other software that has trouble displaying tray icon properly.

### Auto hide menu bar

This option is used to automatically hide menu bar (that contains submenus like *File*, *Window* or *View*), instead to show them. Currently menu bar is enabled by the default, so the users can access the settings submenu and tweak the app.

**TIP:** If you have hidden the menu bar with this option, you can unhide it with the \[ALT\] key.

### Hide side bar

This option is implemented to hide the Discord's side menu bar (that displays the channel list). Currently, it is the only setting that can be changed when using Discord without the need to restart the app. It is also meant to make it more compact to look, making it a lot easier to use on mobile devices or on smaller displays.

### Content Security Policy settings

It defines the rules that browser will use to either accept loading the content or not. Currently it can be configured to these states:
- Disabled – no CSP, everything can be run or loaded that is on website. Use this to troubleshoot issues with CSP that may block the website that should be loaded.
- Enabled – CSP, websites or content that is whitelisted will be able to run only. Should be used by most users that want full discord features.
- Discord servers only (aka. *strict*) – all servers unasociated with the Discords are blocked by CSP, for even better security and privacy. Use this only if you aknowledge the limitations (like no GIF integrations or no Spotify API in the Discord).