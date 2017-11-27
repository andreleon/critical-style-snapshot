import getNodeCSSRules from '../polyfills/get-matched-css-rules.jsx';
import CriticalCSS from '../generators/CriticalCSS.jsx';
import DocumentCSSMediaRules from '../generators/DocumentCSSMediaRules.jsx';
import selectText from '../utilities/selectText.jsx';
import removeDocumentStyles from '../utilities/removeDocumentStyles.jsx';
import createPopup from '../templates/popup.jsx';

var containerElement;

function createMediaBar(mediaRules) {
    var mediaBar = document.createElement('div');
    mediaBar.className = 'alcss-media-bar';
    var barHeight = 5;

    mediaBar.style.height = `${mediaRules.length * barHeight}px`;
    var barHTML = '';

    mediaRules.forEach((rule, index) => {
        if (rule['min-width']) {
            const minWidth = rule['min-width'];
            barHTML += `
                <div class="alcss-media-rule"
                    style="
                        height: ${ barHeight }px;
                        left: ${ minWidth.value }${ minWidth.unit };
                        right: 0;
                        bottom: ${ index * barHeight }px;
                    ">
                </div>
            `;
        } else if (rule['max-width']) {
            const maxWidth = rule['max-width'];
            barHTML += `
                <div class="alcss-media-rule"
                    style="
                        height: ${ barHeight }px;
                        width: ${ maxWidth.value }${ maxWidth.unit };
                        bottom: ${ index * barHeight }px;
                    ">
                </div>
            `;
        }
    });

    mediaBar.innerHTML = barHTML;
    return mediaBar;
}

function showMediaQueries(event) {
    event.preventDefault();
    event.stopPropagation();
    var mediaRules = new DocumentCSSMediaRules().generate();
    var bar = createMediaBar(mediaRules);
    containerElement.append(bar);
}

// Generates the popup with wich the user will interact
function showPopup() {
    var copyGeneratedStylesheet = function(event) {
        event.preventDefault();
        event.stopPropagation();

        selectText('alcss-output-css');
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
        selectText('alcss-output-css');
    };

    var closePopup = function(event) {
        if (event) event.preventDefault();
        destroyPopup();
    };

    var minifyPopup = function() {
        popup.className = 'alcss-container__minified';
    };

    var destroyPopup = function() {
        mediaButton.removeEventListener('click', showMediaQueries);
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

    var mediaButton = document.getElementById('alcss__media');
    var copyButton = document.getElementById('alcss__copy');
    var previewButton = document.getElementById('alcss__preview');
    var outputElement = document.getElementById('alcss-output-css');
    containerElement = document.getElementById('alcss-container');

    mediaButton.addEventListener('click', showMediaQueries);
    copyButton.addEventListener('click', copyGeneratedStylesheet);
    previewButton.addEventListener('click', previewGeneratedStylesheet);
    outputElement.addEventListener('click', selectGeneratedStylesheet);
    containerElement.addEventListener('click', closePopup);
};

export { showPopup };
