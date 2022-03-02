## WebCord's localization notes and tips

This document will describe how to properly translate WebCord client to your
language (if you feel more comfortable in using it in your native language
rather than in English).

### Recent changes

Since version `2.0.0`, there were a major change regarding to the localization
files loading method. From this version, errors are properly handled, so the
application no longer crashes when there's some syntax/type error in the
translation files and loads the fallback strings instead.

Other change introduced with this version was that English localization files
were moved to `sources/code/modules/l10n.ts`, so their type is always recent
with the changes done to the default, fallback strings.

### How to translate?

#### How WebCord implements translations

Before you will begin to translate WebCord, you should understood a basics about
WebCord's localization support implementation.

In the WebCord sources, you may have noticed the following directory:
`sources/assets/translations`. This is the folder where official translations
are published and which are always distributed within the application itself.

To get information about the system language, WebCord also uses
[`app.getLocale()`][app.getLocale]
Electron API, which (as described in Electron Docs) uses the Chromium
`l10n_util` library to get information about the system language. Hence the
folder names in `translations` folder are possible values returned by
`app.getLocale()` function, the list of possible code names is described
[here][chromium-l10n].

#### Supported file formats/extensions

As of the translation format, WebCord is capable of understanding these two file
formats:

- Regular JSON files.
- JSONC (aka. *JSON with Comments*) file format.

JSONC parser supports following comment styles:

- C-like end-of-line comments:

```jsonc
// Example of end-of-line comment
```

- C++-like block comments (both single-line and multi-line):

```jsonc
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

1. Download and install latest WebCord version.

2. Check which is the code name of the language to which you want to translate
   WebCord, that is supported by Chromium L10N library. You find list of
   available language codes [in this file][chromium-l10n].

3. Create a new folder with the name of the target language – the code name you
  found in previous step.

4. Run `webcord --export-l10n={dir}`, where `{dir}` is a directory you've created
   in previous step.

5. Translate string them, either following [JSON standard][json] or JSONC file
   format if you want comments support. Be aware that comments in regular JSON
   files (`*.json`) are treated as a syntax error by WebCord.

6. If you're done with translating WebCord, you can test your translations by
   coping the folder that you previously made to
   `{Path where 'app.asar' is placed}/translations` – on Windows and Linux,
   `app.asar` is usually placed in the `resources` folder next to WebCord's
   Electron binary.

[chromium-l10n]: https://source.chromium.org/chromium/chromium/src/+/master:ui/base/l10n/l10n_util.cc;l=56-232 "l10n_util.cc – Chromium Code Search."
[app.getLocale]: https://www.electronjs.org/docs/api/app#appgetlocale "Returns `String` - The current application locale, fetched using Chromium's `l10n_util` library."
[json]: https://www.json.org "JavaScript Object Notation – lightweight and human-friendly data-interchange format."
