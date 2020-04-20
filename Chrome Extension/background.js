chrome.runtime.onInstalled.addListener(function(){
    var storage = {};
    storage["Websites"] = {};
    storage["Settings"] = {"BlockType" : "Visibility"};
    chrome.storage.sync.set(storage);
});