// removes all css styles from the webpage
function removeDocumentStyles() {
    var appCssElements = [].slice.call(document.querySelectorAll('[type="text/css"]'));
    appCssElements.forEach(function(elm) {
        elm.remove();
    });

    var appStylesheetElements = [].slice.call(document.querySelectorAll('[rel="stylesheet"]'));
    appStylesheetElements.forEach(function(elm) {
        elm.remove();
    });

    var appStyleElements = [].slice.call(document.getElementsByTagName('style'));
    appStyleElements.forEach(function(elm) {
        elm.remove();
    });
}

export default removeDocumentStyles;
