(function() {
    var CriticalCSS = function(window, document, options) {
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
                    var rules = window.getMatchedCSSRules(node);

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

    function selectText(containerid) {
        var el = document.getElementById(containerid)
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    document.body.scrollTop = 0;

    var ccss = new CriticalCSS(window, document);
    var css = ccss.generate();

    var criticalWrapper = document.createElement('div');
    criticalWrapper.id = 'CriticalSnap';

    var divHTML = '<div><h1>Critical Snapshot</h1>';

    divHTML += '<p id="CriticalSnap__output-css">' + css + '</p>';
    divHTML += '<div id="CriticalSnap__buttons"><button type="button" class="CriticalSnap__button" id="CriticalSnap__copy">Copy</button>';
    divHTML += '<button type="button" class="CriticalSnap__button" id="CriticalSnap__preview">Preview</button>';
    divHTML += '<button type="button" class="CriticalSnap__button" id="CriticalSnap__close">Close</button></div>';

    divHTML += '</div>';
    criticalWrapper.innerHTML = divHTML;

    document.body.appendChild(criticalWrapper);

    var copyHandler = function(event) {
        event.preventDefault();
        event.stopPropagation();
        selectText('CriticalSnap__output-css');
        document.execCommand('copy');
        copyButton.style.backgroundColor = "#34A853";
        copyButton.style.color = "#fff";
        copyButton.innerHTML = "Copied <span>👍</span>";
    };

    var previewHandler = function(event) {
        event.preventDefault();
        event.stopPropagation();

        const appCssElements = [].slice.call(document.querySelectorAll('[type="text/css"]'));
        appCssElements.forEach(function(elm) {
            elm.remove();
        });
        const appStyleElements = [].slice.call(document.getElementsByTagName('style'));
        appStyleElements.forEach(function(elm) {
            elm.remove();
        });

        var previewStyle = document.createElement('style');
        previewStyle.innerHTML = css;
        document.getElementsByTagName('head')[0].appendChild(previewStyle);

        previewButton.removeEventListener('click', previewHandler);
        previewButton.remove();

        minify();
    };

    var selectHandler = function(event) {
        event.preventDefault();
        event.stopPropagation();
        selectText('CriticalSnap__output-css');
    };

    var closeHandler = function(event) {
        if (event) event.preventDefault();
        destroy();
    };

    var minify = function() {
        criticalWrapper.className = 'CriticalSnap__minified';
    };

    var copyButton = document.getElementById('CriticalSnap__copy');
    var previewButton = document.getElementById('CriticalSnap__preview');
    var outputElement = document.getElementById('CriticalSnap__output-css');
    var containerElement = document.getElementById('CriticalSnap');

    copyButton.addEventListener('click', copyHandler);
    previewButton.addEventListener('click', previewHandler);
    outputElement.addEventListener('click', selectHandler);
    containerElement.addEventListener('click', closeHandler);

    var destroy = function() {
        copyButton.removeEventListener('click', copyHandler);
        previewButton.removeEventListener('click', previewHandler);
        outputElement.removeEventListener('click', selectHandler);
        containerElement.removeEventListener('click', closeHandler);
        criticalWrapper.remove();
    };
})();
