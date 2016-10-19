// regex: [\(](min-width|max-width):\s([0-9]{1,})(rem|em|px|%|vw|vh|cm|ex|in|mm|pc|pt|vmin)[\)]
import arrayContainsObject from '../utilities/arrayContainsObject.jsx';

var DocumentCSSMediaRules = function() {
    var documentMediaRules = [];
    var toArray = function(list) {
        list = list || {};
        return [].slice.call(list);
    };

    var stylesheets = toArray(document.styleSheets);
    stylesheets.forEach(function(stylesheet) {
        var rules = toArray(stylesheet.cssRules || stylesheet.rules || []);
        rules.forEach(function(rule) {
            // console.log(rule.type)
            if (rule.type === CSSRule.MEDIA_RULE) documentMediaRules.push(rule);
        });
    });

    var hasNumber = function(text) {
        var number = parseFloat(text.replace(/[^\d.]/g, ''));
        return !isNaN(number);
    };

    this.generate = function() {
        var unique = [];
        documentMediaRules.forEach(function(item) {
            var mediaRegEx = /[\(](min-width|max-width):\s([0-9]{1,})(rem|em|px|%|vw|vh|cm|ex|in|mm|pc|pt|vmin)[\)]/gi;
            var queries = item.media.mediaText.match(mediaRegEx);
            if (!queries) return;
            var mediaObject = queries.reduce(function(outputObject, query) {
                var regex = /[\(](min-width|max-width):\s([0-9]{1,})(rem|em|px|%|vw|vh|cm|ex|in|mm|pc|pt|vmin)[\)]/gi;
                var match = regex.exec(query);
                if (match) {
                    outputObject[match[1]] = {
                        value: parseInt(match[2]),
                        unit: match[3]
                    };
                }
                return outputObject;
            }, {});

            if (!arrayContainsObject(unique, mediaObject)) unique.push(mediaObject);
        });
        return unique.sort(function(a, b) {
            if (a['min-width'] && b['min-width']) {
                if (a['min-width'].value < b['min-width'].value) return -1;
                if (a['min-width'].value > b['min-width'].value) return 1;
            }
            if (!a['min-width'] && b['min-width']) {
                if (a['max-width'].value < b['min-width'].value) return -1;
                if (a['max-width'].value > b['min-width'].value) return 1;
            }
            if (a['min-width'] && !b['min-width']) {
                if (a['min-width'].value < b['max-width'].value) return -1;
                if (a['min-width'].value > b['max-width'].value) return 1;
            }
            return 0;
        });
    };
};

export default DocumentCSSMediaRules;
