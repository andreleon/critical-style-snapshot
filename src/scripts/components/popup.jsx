import getNodeCSSRules from '../polyfills/get-matched-css-rules.jsx';
import CriticalCSS from '../generators/CriticalCSS.jsx';
import selectText from '../utilities/selectText.jsx';
import removeDocumentStyles from '../utilities/removeDocumentStyles.jsx';

// Generates the popup with wich the user will interact
function showPopup() {
    var copyGeneratedStylesheet = function(event) {
        event.preventDefault();
        event.stopPropagation();

        selectText('CriticalSnap__output-css');
        document.execCommand('copy');
        copyButton.style.backgroundColor = "#34A853";
        copyButton.style.color = "#fff";
        copyButton.innerHTML = "Copied <span>👍</span>";
    };

    var previewGeneratedStylesheet = function(event) {
        event.preventDefault();
        event.stopPropagation();

        removeDocumentStyles();

        var previewStyle = document.createElement('style');
        previewStyle.innerHTML = stylesheet;
        document.getElementsByTagName('head')[0].appendChild(previewStyle);

        previewButton.removeEventListener('click', previewGeneratedStylesheet);
        previewButton.remove();

        minifyPopup();
    };

    var selectGeneratedStylesheet = function(event) {
        event.preventDefault();
        event.stopPropagation();
        selectText('CriticalSnap__output-css');
    };

    var closePopup = function(event) {
        if (event) event.preventDefault();
        destroyPopup();
    };

    var createPopup = function(content) {
        var popup = document.createElement('div');
        popup.id = 'CriticalSnap';

        var divHTML = '';
        divHTML +=  '<div><h1>Critical Snapshot</h1>';
        divHTML +=      '<p id="CriticalSnap__output-css">';
        divHTML +=          content
        divHTML +=      '</p>';
        divHTML +=      '<div id="CriticalSnap__buttons">';
        divHTML +=          '<button type="button" class="CriticalSnap__button" id="CriticalSnap__copy">Copy</button>';
        divHTML +=          '<button type="button" class="CriticalSnap__button" id="CriticalSnap__preview">Preview</button>';
        divHTML +=          '<button type="button" class="CriticalSnap__button" id="CriticalSnap__close">Close</button>';
        divHTML +=      '</div>';
        divHTML +=  '</div>';

        popup.innerHTML = divHTML;

        return popup;
    };

    var minifyPopup = function() {
        popup.className = 'CriticalSnap__minified';
    };

    var destroyPopup = function() {
        copyButton.removeEventListener('click', copyGeneratedStylesheet);
        previewButton.removeEventListener('click', previewGeneratedStylesheet);
        outputElement.removeEventListener('click', selectGeneratedStylesheet);
        containerElement.removeEventListener('click', closePopup);
        popup.remove();
    };

    // scroll to top before generating CSS
    document.body.scrollTop = 0;

    var snapshot = new CriticalCSS(window, document);
    var stylesheet = snapshot.generate();

    var popup = createPopup(stylesheet);
    document.body.appendChild(popup);

    var copyButton = document.getElementById('CriticalSnap__copy');
    var previewButton = document.getElementById('CriticalSnap__preview');
    var outputElement = document.getElementById('CriticalSnap__output-css');
    var containerElement = document.getElementById('CriticalSnap');

    copyButton.addEventListener('click', copyGeneratedStylesheet);
    previewButton.addEventListener('click', previewGeneratedStylesheet);
    outputElement.addEventListener('click', selectGeneratedStylesheet);
    containerElement.addEventListener('click', closePopup);
};

export { showPopup };
