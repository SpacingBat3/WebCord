# Command line (runtime) flags
WebCord is capable of parsing some Chromium flags and following
application-specific flags:

- **`--start-minimized` or `-m`** – start WebCord minimized in tray;
  usefull when running WebCord at system start;

- **`--version` or `-V`** – display application version and exit even before
  *app is ready*.

- **`--help` or `-h`** – display help information about the application.

- **`--export-l10n={dir}`** – export currently loaded translations as a set of
  JSON files to the **`{dir}`** directory.

- **`--verbose` or `-v`** – show debug messages.

# Build flags:

## 1. In Electron Forge

While packaging the application with the Electron Forge, WebCord supports
following build enviroment variables to set build specific flags:

- `WEBCORD_BUILD={release,stable,devel}` – if set to `release` or `stable`,
  WebCord will be build as a stable release, with some experimental features
  disabled that are not meant for production build. Default build type is
  `devel`.
- `WEBCORD_ASAR={true,false}` – if set to `false`, WebCord won't be packaged to
  the ASAR archive. Default is `true`.

## 2. Other tools

If you're packaging the application on your own, you can create directly a
`buildConfig.json` file, which is used internally by WebCord do determine the
state of the build enviroment flags (except ASAR packaging, this is what you
need to implement or configure with your own Electron packaging software).
The `buildConfig.json` file should be placed in the application's root directory
(i.e. next to `package.json`) and contain following properties:

- `"type": "devel"/"release"` – similary to `WEBCORD_BUILD`, this controls
  whenever this build is meant for production use or for development purposes.
  If not set, WebCord's build type will be set as `devel`.

- `"commit": [hash]` – this property will save the information about the build
  commit; it is ignored for the `release` build type.