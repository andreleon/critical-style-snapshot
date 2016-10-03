var triggeredTabs = [];
var window = chrome.extension.getBackgroundPage();
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.insertCSS(null, {file: "critical.css"});
    chrome.tabs.executeScript(null, {file: "critical.min.js"});
});
