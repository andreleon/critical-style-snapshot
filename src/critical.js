/*
 * Fallback for window.getMatchedCSSRules(node);
 * Forked from: (A Gecko only polyfill for Webkit's window.getMatchedCSSRules) https://gist.github.com/ydaniv/3033012
 * This version is compatible with most browsers
 */
var ELEMENT_RE = /[\w-]+/g;
var ID_RE = /#[\w-]+/g;
var CLASS_RE = /\.[\w-]+/g;
var ATTR_RE = /\[[^\]]+\]/g;
// :not() pseudo-class does not add to specificity, but its content does as if it was outside it
var PSEUDO_CLASSES_RE = /\:(?!not)[\w-]+(\(.*\))?/g;
var PSEUDO_ELEMENTS_RE = /\:\:?(after|before|first-letter|first-line|selection)/g;

// convert an array-like object to array
function toArray (list) {
    list = list || {};
    return [].slice.call(list);
}

// handles extraction of `cssRules` as an `Array` from a stylesheet or something that behaves the same
function getSheetRules (stylesheet) {
    var sheet_media = stylesheet.media && stylesheet.media.mediaText;
    // if this sheet is disabled skip it
    if ( stylesheet.disabled ) return [];
    // if this sheet's media is specified and doesn't match the viewport then skip it
    if ( sheet_media && sheet_media.length && ! window.matchMedia(sheet_media).matches ) return [];
    // get the style rules of this sheet
    return toArray(stylesheet.cssRules);
}

function _find (string, re) {
    var matches = string.match(re);
    return re ? re.length : 0;
}

// calculates the specificity of a given `selector`
function calculateScore (selector) {
    var score = [0,0,0];
    var parts = selector.split(' ');
    var part;
    var match;

    //TODO: clean the ':not' part since the last ELEMENT_RE will pick it up
    while ( part = parts.shift(), typeof part == 'string' ) {
        // find all pseudo-elements
        match = _find(part, PSEUDO_ELEMENTS_RE);
        score[2] = match;
        // and remove them
        match && (part = part.replace(PSEUDO_ELEMENTS_RE, ''));
        // find all pseudo-classes
        match = _find(part, PSEUDO_CLASSES_RE);
        score[1] = match;
        // and remove them
        match && (part = part.replace(PSEUDO_CLASSES_RE, ''));
        // find all attributes
        match = _find(part, ATTR_RE);
        score[1] += match;
        // and remove them
        match && (part = part.replace(ATTR_RE, ''));
        // find all IDs
        match = _find(part, ID_RE);
        score[0] = match;
        // and remove them
        match && (part = part.replace(ID_RE, ''));
        // find all classes
        match = _find(part, CLASS_RE);
        score[1] += match;
        // and remove them
        match && (part = part.replace(CLASS_RE, ''));
        // find all elements
        score[2] += _find(part, ELEMENT_RE);
    }
    return parseInt(score.join(''), 10);
}

// returns the heights possible specificity score an element can get from a give rule's selectorText
function getSpecificityScore (element, selector_text) {
    var selectors = selector_text.split(',');
    var selector;
    var score;
    var result = 0;

    while (selector = selectors.shift()) {
        element.matches = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector;
        if ( element.matches(selector) ) {
            score = calculateScore(selector);
            result = score > result ? score : result;
        }
    }

    return result;
}

function sortBySpecificity (element, rules) {
    // comparing function that sorts CSSStyleRules according to specificity of their `selectorText`
    function compareSpecificity (a, b) {
        return getSpecificityScore(element, b.selectorText) - getSpecificityScore(element, a.selectorText);
    }

    return rules.sort(compareSpecificity);
}

//TODO: not supporting 2nd argument for selecting pseudo elements
//TODO: not supporting 3rd argument for checking author style sheets only
function getNodeCSSRules(element /*, pseudo, author_only*/) {
    var style_sheets;
    var sheet;
    var sheet_media;
    var rules;
    var rule;
    var result = [];

    // get stylesheets and convert to a regular Array
    style_sheets = toArray(window.document.styleSheets);

    // assuming the browser hands us stylesheets in order of appearance
    // we iterate them from the beginning to follow proper cascade order
    while (sheet = style_sheets.shift()) {
        // get the style rules of this sheet
        rules = getSheetRules(sheet);
        // loop the rules in order of appearance
        while (rule = rules.shift()) {
            // if this is an @import rule
            if (rule.styleSheet) {
                // insert the imported stylesheet's rules at the beginning of this stylesheet's rules
                rules = getSheetRules(rule.styleSheet).concat(rules);
                // and skip this rule
                continue;
            }
            // if there's no stylesheet attribute BUT there IS a media attribute it's a media rule
            else if (rule.media) {
                // insert the contained rules of this media rule to the beginning of this stylesheet's rules
                rules = getSheetRules(rule).concat(rules);
                // and skip it
                continue
            }

            // check if this element matches this rule's selector
            if (element.matches(rule.selectorText)) {
                // push the rule to the results set
                result.push(rule);
            }
        }
    }

    // sort according to specificity
    return sortBySpecificity(element, result);
};

function explainWarning() {
    if (window.explained) return;
    console.log('%cWhen \'getMatchedCSSRules()\' is removed, Critical Snapshot will fallback to a polyfill. Untill then, we will use the native version for better performance.', 'color: aqua;');
    window.explained = true;
}

// Selects element text by ID
function selectText(id) {
    var element = document.getElementById(id)

    var range = document.createRange();
    range.selectNodeContents(element);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// removes all css styles from the webpage
function removeDocumentStyles() {
    var appCssElements = [].slice.call(document.querySelectorAll('[type="text/css"]'));
    appCssElements.forEach(function(elm) {
        elm.remove();
    });

    var appStyleElements = [].slice.call(document.getElementsByTagName('style'));
    appStyleElements.forEach(function(elm) {
        elm.remove();
    });
}

// CSS generator
var CriticalSnapshot = function(window, document, options) {
    var options = options || {};
    var parsedCSS = {};

    var pushCSS = function(rule) {
        if(!!parsedCSS[rule.selectorText] === false) parsedCSS[rule.selectorText] = {};

        var styles = rule.style.cssText.split(/;(?![A-Za-z0-9])/);

        styles.forEach(function(style) {
            if(!!style === false) return;

            var pair = style.split(': ');
            pair[0] = pair[0].trim();
            pair[1] = pair[1].trim();
            parsedCSS[rule.selectorText][pair[0]] = pair[1];

        });
    };

    var parseTree = function() {
        var height = window.innerHeight;
        var walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT, function(node) { return NodeFilter.FILTER_ACCEPT; }, true);

        while(walker.nextNode()) {
            var node = walker.currentNode;
            var rect = node.getBoundingClientRect();
            if(rect.top < height || options.scanFullPage) {
                var rules;
                if ( typeof window.getMatchedCSSRules !== 'function' ) {
                    rules = getNodeCSSRules(node);
                } else {
                    rules = window.getMatchedCSSRules(node);

                    explainWarning();
                }
                if (!rules) rules = getNodeCSSRules(node);

                if(!!rules) {
                    for (var i = 0; i < rules.length; i++) {
                        pushCSS(rules[i]);

                    }
                }

            }
        }
    };

    this.generate = function() {
        var outputCSS = '';

        for(var key in parsedCSS) {
            outputCSS += key + '{';

            for(var innerKey in parsedCSS[key]) {
                outputCSS += innerKey + ':' + parsedCSS[key][innerKey] + ';';

            }

            outputCSS += '}';
        }

        return outputCSS;
    };

    parseTree();
};

// Generates the popup with wich the user will interact
function generatePopup() {
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

    var snapshot = new CriticalSnapshot(window, document);
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

// initialize
generatePopup();
