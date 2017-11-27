var triggeredTabs = [];
var window = chrome.extension.getBackgroundPage();
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.insertCSS(null, {file: "styles/style.css"});
    chrome.tabs.executeScript(null, {file: "scripts/execute.js"});
    // chrome.tabs.executeScript(null, {file: "https://buttons.github.io/buttons.js"});
});
