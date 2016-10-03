## Critical Snapshot

![icon](/src/icon128.png?raw=true "Optional Title")

Capture CSS above the fold with one click. Works for most websites, this extension captures 99% of the of the currently active media query CSS. Selectors like pseudo-elements don't get captured (yet), so in some cases minor tweaking is nessescary.

This Chrome Extension uses a slightly altered version of this [CriticalCSS Bookmarklet and Devtool Snippetjs](https://gist.github.com/PaulKinlan/6284142)

## TODO:
- Replace `window.getMatchedCSSRules();` since it is depricated
- Support pseudo elements
- Re-capture on window-resize for easy media-query capturing
- Auto prefixing
- Auto optimize
