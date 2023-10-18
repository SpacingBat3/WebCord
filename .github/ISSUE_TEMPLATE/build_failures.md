---
name: Build failure report.
about: Report issues when building / packaging the application.
title: ''
labels: 'type:build'
assignees: SpacingBat3

---

<!-- BEGIN TEMPLATE

Please use this template only for issues when building WebCord from source only
when packaging app with Electron Forge or using `webcord-git` PKGBUILD on AUR.

I do not maintain other packaging methods (e.g.  pi-apps), therefore please do
not report them here.

-->

### Acknowledgements ###

- [ ] There's no other issue describing the same problem, regardless of its current state (i.e. including both closed and open issues).\*
- [ ] There's no fix for my issue released to `master` branch.\*
- [ ] This issue has known workaround (write it below).

<sub>* Required</sub>

### Environment ###
<!--
Make sure you have filled most or all details below, else it might take longer
to resolve it and you will be requested to fill missing details anyway.
-->
 - Platform: [e.g. `🐧️ linux`]
 - Architecture: [e.g `arm64`/`aarch64`]
 - Electron version: [e.g. `v12.0.7`]
 - Electron Forge version: [e.g. `v6.3.0`]
 - Application version: [e.g. `v4.4.0`]
 - TypeScript compiler version: [e.g. `5.0.0`]
 - Node.js package manager: [e.g. `npm`]
    - Node.js package manger version: [e.g. `9.8.1`]

### Describe the problem ###
A clear and concise description of where the build and package process fails.

### To Reproduce ###
Steps to reproduce the behaviour:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error.

### Expected behaviour ###
A clear and concise description of what you expected to happen.

### Screenshots ###
If applicable, add screenshots to help explain your problem.

### Additional context ###
Add any other context about the problem here.

<!-- Remove this line to enable

### Workarounds ###
Write any alternative method/s that can be reproduced to fix this issue until it will be fixed in code and/or releases.

<!-- END TEMPLATE – Make sure you've read all comments and filled all requested fields. -->