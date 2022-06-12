# How to contribute in the project?

This file describes in general the ways of contribution within the 

## How do I report a bug or request a new feature?

You can do this via the application's menu bar or the tray menu. Application will
then generate a link to the new GitHub issue with the pre-filled details about
your operating system (you still need to describe the issue through, it doesn't
automatically send a bug report for you). You can also report issues via the
project's GitHub repository.

When creating a GitHub issue, please take a look:

  - if there're any similar issues (including the closed ones); if so, try to
    describe your issue under that one or ask to reopen it to bring me attention;

  - if your issue can be reproduced within the web version – fixing Discord
    bugs there isn't for now the priority of this project and could cause a
    possible breakages on the site updates;

## How could I work within app development and create a pull request?

When working with the WebCord's source code, I recommend reading the
documentation about [each of the files](./Files.md) and what is their purpose in
WebCord to know where you should put your code within the existing files. I'm
also encouraging to read the following parts of the documentation:

- [`Build.md`], to know more about current WebCord's development script syntax,
  including how to compile, test and package source files.

- [`Flags.md`], to know a little more about the current build flags
  implementation.

## How to translate WebCord?

Currently WebCord has moved its translation to its [Weblate instance][weblate].
It includes the current state of the translation project, instructions and
limitations. You are free to translate it *the old way* (by doing a PR), yet
Weblate changes might be pulled earlier in order to avoid conflicts on Weblate
side.

## Other ways of the contribution:

You can also help to maintain this project by:
  - taking part in / answering GitHub discussions,
  - helping me to solve issues,
  - updating / working on the documentation,
  - reviewing the WebCord's source code or pull requests and suggesting the
    changes.

[`Build.md`]: Build.md
[`Flags.md`]: Flags.md
[weblate]: https://hosted.weblate.org/projects/spacingbat3-webcord