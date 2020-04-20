chrome.runtime.onInstalled.addListener(function(){
    var storage = {};
    storage["Websites"] = {};
    storage["Settings"] = {"BlockType" : "Visibility"};
    storage["Settings"]["Whitelist"] = [];
    chrome.storage.sync.set(storage);
});