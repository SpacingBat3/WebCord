# Command line (runtime) flags

WebCord is capable of parsing some Chromium flags and following
application-specific flags:

- **`--start-minimized` or `-m`** – start WebCord minimized in tray;
  useful when running WebCord at system start;

- **`--version` or `-V`** – display application version and exit even before
  *app is ready*.

- **`--help`, `-?` or `-h`** – display help information about the application.

- **`--export-l10n={dir}`** – export currently loaded translations as a set of
  JSON files to the **`{dir}`** directory.

- **`--verbose` or `-v`** – show debug messages.

- **`--gpu-info=basic|complete`** – displays a raw GPU information from Chromium
  in form of a JavaScript object.

# Build flags:

## 1. In Electron Forge

While packaging the application with the Electron Forge, WebCord supports
following build environment variables to set build specific flags:

- `WEBCORD_BUILD={release,stable,devel}` – if set to `release` or `stable`,
  WebCord will be build as a stable release, with some experimental features
  disabled that are not meant for production build. Default build type is
  `devel`.

- `WEBCORD_ASAR={true,false}` – if set to `false`, WebCord won't be packaged to
  the `asar` archive. Default is `true`.

- `WEBCORD_UPDATE_NOTIFICATIONS={true,false}` – if set to `false`, notifications
  won't show on the new updates; this feature is meant for the package
  maintainers so they can disable the notifications for their users and let the
  package manager to handle the update notifications.

- `WEBCORD_WIN32_APPID=[string]` *(Windows only)* – replaces the `ApplicationUserModelID`, used
  as an unique application identifier. Default is `SpacingBat3.WebCord`. You
  should replace it if you want to differ your build from the official ones,
  e.g. if you release your own WebCord package for Windows with your own
  patches and want to allow for coexisting it with the official WebCord
  executables.

- `WEBCORD_FLATPAK_ID=[string]` *(Linux only)* – Used in Flatpak manifest file
  as an unique app identifier. For community builds it should be set to
  something else. Defaults to `io.github.spacingbat3.webcord`

## 2. Other tools

If you're packaging the application on your own, you can create directly a
`buildInfo.json` file, which is used internally by WebCord do determine the
state of the build environment flags (except `asar` packaging, this is what you
need to implement or configure with your own Electron packaging software).
The `buildInfo.json` file should be placed in the application's root directory
(i.e. next to `package.json`) and contain following properties:

- `"type": "devel"/"release"` – similarly to `WEBCORD_BUILD`, this controls
  whenever this build is meant for production use or for development purposes.
  If not set, WebCord's build type will be set as `devel`.

- `"commit": [hash]` – this property will save the information about the build
  commit; it is ignored for the `release` build type.

- `AppUserModelId: [string]` *(Windows only)* – definies an
  `ApplicationUserModelId` of the WebCord build, this should always be present
  in Windows distributables.

- `"features": [Object]` – this is the object controlling some features;
  currently it can contain these optional properties:

    - `"updateNotifications": true/false` – whenever to show notifications on
      the new releases; this does not disable the update checker to print the
      its current status in the console (i.e. if the version is out-of-date).