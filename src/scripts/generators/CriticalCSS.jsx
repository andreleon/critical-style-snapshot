import explainWarning from '../utilities/explainWarning.jsx';
import getNodeCSSRules from '../polyfills/get-matched-css-rules.jsx';
// CSS generator
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

export default CriticalCSS;
