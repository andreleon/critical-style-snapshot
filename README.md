## Critical Snapshot

![icon](/src/promotional.png?raw=true "Critical Snapshot")

Capture CSS above the fold with one click. Works for most websites, this extension captures 99% of the of the currently active media query CSS. Selectors like pseudo-elements don't get captured (yet), so in some cases minor tweaking is nessescary.

This Chrome Extension uses a slightly altered version of this [CriticalCSS Bookmarklet and Devtool Snippetjs](https://gist.github.com/PaulKinlan/6284142)

## Features
- Capture your webpage above the fold CSS with one click
- Copy the CSS with one extra click
- Preview the captured CSS

## Installation
No setup required, [Install it directly from the Chrome Webstore](https://chrome.google.com/webstore/detail/critical-snapshot/gkoeffcejdhhojognlonafnijfkcepob)

## TODO
- Replace `window.getMatchedCSSRules();` since it is depricated
- Support pseudo elements
- Re-capture on window-resize for easy media-query capturing
- Auto prefixing
- Auto optimize
