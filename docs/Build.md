# Working with the sources

When working with the WebCord, there're many tools you may have to use to be
able to compile it from TypeScript to JavaScript, package it to the
distributable format, run linter and so on. This section will describe the
commands you may need to know to proceed with its development or packaging it
yourself from its source code.

<table class="alert-info">
<tr>
    <td> ℹ️ </td>
    <td>
        To simplify the documentation, only <code>npm</code> command syntax is
        shown below. If you prefer using another package manager, you're free to
        do so as in my philosophy you should not be limited with the set of
        tools used by maintainers and have the right to choose your own.
    </td>
</tr>
</table>
<table class="alert-warn">
<tr>
    <td> ⚠️ </td>
    <td>
        WebCord comes with <code>package-lock.json</code> as a lock file format
        and your preffered package manager might not be functional with it. You
        still can install the latest dependencies, yet the created lockfile will
        not be used to reproduce the tested enviroment when a dependency
        breakage will occur.
    </td>
</tr>
</table>

## Install app dependencies.

This is the first command you need to execute – without that, you won't be able
to proceed with the app testing and run most of the commands listed in
`package.json`.
```sh
npm ci
```

This command uses `package-lock.json` which contains resolved package tree for
faster package installations. While `package-lock.json` contains the dependency
tree confirmed to work in the past or in case of the releases it can also be
used to reproduce the builds, you might want to opt-in for the latest
*non-breaking* (according to `semver` specification) dependencies that might
contain bug fixes and security patches. This normally won't cause any breakages
and you could still go back to the previous state with `git` if anything goes
wrong.

To update dependencies to the latest version available:

```
npm update
```

Be aware that `npm ci` will also install the development dependencies. **This is**
**probably what you want**, as those dependencies includes all of the
recommended packages required for compiling, linting and packaging WebCord. If
you however want to install the production dependencies only (i.e. you want to
use your own set of the tools or have installed them globally with `npm i -g`),
you can use the following command instead:
```
npm i --only=prod
```

## Compile code and run app directly (without packaging).

After you have installed all required `dependencies` and `devDependencies`, you
can use the following command to incrementally compile WebCord's source code
from TypeScript to JavaScript:
```
npm run build
```

To both compile code and start application even before it is packaged:
```
npm start
```

## Run linter and validate the code.

While developing, you may want to check if your code quality is enough to be
accepted as part of the WebCord project. To do that, you may want to both
compile it (to ensure there're no compiler errors) and run linter (to check for
the other issues). To do this, you can use the command below:
```
npm test
```

You can also run linter only if you don't want to compile the code:
```
npm run lint
```

## Packaging / creating distributables.

If you want to share with someone the binaries of your packaged application, or
just install and/or use it without the source code and development packages,
you can generate all distributable files that are valid for your platform using
following command:
```
npm run make
```

You can also create a directory containing a packaged app. This directory isn't
adapted for a specific distributable format, but it contains the Electron binary
with the compiled application, which needs to be set up manually if you want to
install it within your OS. To package an application without packing it as
distributable, execute the following command:
```
npm run package
```

This will package the app for your current platform.

## Build environment variables.

While making app distributables with the `npm run make` you can use some
environment variables that will take effect on the application before it is
packaged. See [`Flags.md`](./Flags.md#1-in-electron-forge) for the further
information.