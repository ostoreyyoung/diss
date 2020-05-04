chrome.runtime.onInstalled.addListener(function(){
    var storage = {};
    storage["Websites"] = {};
    storage["Settings"] = {"BlockType" : "Visibility"};
    storage["Settings"]["Whitelist"] = [];
    chrome.storage.sync.set(storage);
});

chrome.webRequest.onBeforeRequest.addListener(
	function() {
		return {cancel: true };
	},
	{urls: ["*://*.youtube.com/"]},
	["blocking"]
);