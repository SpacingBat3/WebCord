## WebCord's localization notes and tips

This document will describe how to properly tranlate WebCord client to your language (if you feel more comfortable in using it in your native language rather than in English).

### Recent changes

As of WebCord release 1.6.0 or newer, the way how unofficial translations are handled has been changed – because many translation files were broken after recent updates in the past (mostly Spanish ones), I decided to **not to include any of the community-made translations** and let others host them on their own rules/licenses in their own repositories. It will now support an additional directory, which is `/path/to/app.asar/../translations`. The folder is basically treaded by WebCord as `sources/assets/translations` internal application folder, except it has a lower priority and strings from it are loaded only in case of missing localized translations (so no malicious changes can be made to ).

If you want to recover the removed translations, you can easily revert back recent commits or fetch them from the older releases source code. If you wish to share somewhere your translations, you are free to make a new thread in General category at WebCord's Github Discussions page. As of Linux distributions, I also advise to distribute translations in the format that is friendly to package (e.g. by distributing a `PKGBUILD` and/or publishing it to AUR) – please remember then to add a proper WebCord package as a dependency.

In the future, I may create a deticated repository for community translations only, if someone wants to host them in one place.

### How to translate?

#### How WebCord implements translations

Before you will begin to translate WebCord, you should understood a basics about WebCord's localization support implementation.

In the WebCord sources, you may have noticed the following directory: `sources/assets/translations`. This is the folder where official translations are published and which are always distributed within the application itself.

To get information about the system language, WebCord also uses [`app.getLocale()`](https://www.electronjs.org/docs/api/app#appgetlocale) Electron API, which (as described in Electron Docs) uses the Chromium `l10n_util` library to get information about the system language. Hence the folder names in `translations` folder are possible values returned by `app.getLocale()` function, the list of possible code names is described [here](https://source.chromium.org/chromium/chromium/src/+/master:ui/base/l10n/l10n_util.cc;l=56-232).

#### Supported file formats/extensions

As of the translation format, WebCord is capable of understanding the two file formats:

- Regular JSON files.
- JSONC (aka. *JSON with Comments*) file format.

JSONC parser supports following comment styles:

- C-like end-of-line comments:
```jsonc
// Example of end-of-line comment
```

- C++-like block comments (both single-line and multi-line):
```ts
/* Single-line comment */

/**
 * Multi-line comment
 * 
 * Can be used for longer description 
 */

/*
 * Two 'star' symbols for opening a comment
 * isn't a requirement BTW
 */
```

#### Translating WebCord and testing translations

- Get reference strings from the repository (for English strings: [soures/assets/en-GB/strings.jsonc](../sources/assets/en-GB/strings.jsonc)).
- Check which is the code name of the language to which you want to translate WebCord, that is supported by Chromium L10N library. You find list of available language codes [in this file](https://source.chromium.org/chromium/chromium/src/+/master:ui/base/l10n/l10n_util.cc).
- Create a new folder with the name of the target language – the code name you found in previous step.
- Copy reference strings to that folder and translate them, either following [JSON standard](https://www.json.org) or JSONC file format if you want comments support. Be aware that comments in regular JSON files (`*.json`) are treated as a syntax error by WebCord.
- If you're done with translating WebCord, you can test your translations by coping the folder that you previously made to `{Path where 'app.asar' is placed}/translations` – on Windows and Linux, `app.asar` is usually placed in the `resources` folder next to WebCord binary.