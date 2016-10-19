function explainWarning() {
    if (window.explained) return;
    console.log('%cWhen \'getMatchedCSSRules()\' is removed, Critical Snapshot will fallback to a polyfill. Untill then, we will use the native version for better performance.', 'color: aqua;');
    window.explained = true;
}

export default explainWarning;
