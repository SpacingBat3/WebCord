## About the application settings
This section will describe different options found in the "Settings" submenu and
command line flags.

**NOTE:** Currently most settings requires to restart the application to see any
changes.

### Disable tray

This option will hide application tray, as well as some integrations done for it.
It is meant to be used on the Linux distributions, desktop enviroments or with
any other software that has trouble displaying tray icon properly.

### Auto hide menu bar

This option is used to automatically hide menu bar (that contains submenus like
*File*, *Window* or *View*), instead to show them. Currently menu bar is enabled
by the default, so the users can access the settings submenu and tweak the app.

**TIP:** If you have hidden the menu bar with this option, you can unhide it
with the \[ALT\] key.

### Hide side bar

This option is implemented to hide the Discord's side menu bar (that displays
the channel list). Currently, it is the only setting that can be changed when
using Discord without the need to restart the app. It is also meant to make it
more compact to look, making it a lot easier to use on mobile devices or on
smaller displays.

**TIP:** You can easily toogle this setting by pressing \[ALT+CTRL/CMD+M\] on
the keyboard.

### Content Security Policy settings

It defines the rules that browser will use to either accept loading the content
or not. Currently, CSP can be disabled or enabled and optionally configured to
block selected third-party websites.

### Enable Developer mode

Controls whenever experimental features and DevTools are enabled. It can be used
to debug an application or test unfinished or experimental features. This
setting can be only toggled in production builds – if you run the app without
packaging it (via `npm start` command) you are unable to turn it off.

**NOTE:** Some features may still not be available when app is packaged, even
after toggling on this setting.

### CLI Flags
WebCord is capable of parsing some Chromium flags and following
application-specific flags:

- **`--start-minimized` or `-m`** – start WebCord minimized in tray;
usefull when running WebCord at boot/login process;

- **`--version` or `-v`** – display application version and exit even before
*app is ready*.