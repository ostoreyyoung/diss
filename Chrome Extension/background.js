var webFilterList = [];
var manualFilterList = [];
var defaultFilterList = [];

//Set up storage.sync when the extension is installed.
chrome.runtime.onInstalled.addListener(function(){
    var storage = {};
    storage["Websites"] = {};
    storage["Settings"] = {};
    storage["Settings"]["BlockType"] = "Visibility";
    storage["Settings"]["webBlockURL"] = "";
    storage["Settings"]["useWebBlockURL"] = false;
    storage["Settings"]["useDefaultBlock"] = false;
    storage["Settings"]["Whitelist"] = [];
    storage["Blocked"] = [];
    chrome.storage.sync.set(storage);

    chrome.storage.sync.get(null,function(res){
        console.log(res)
    })
});

//Import filter list from url
var req = new XMLHttpRequest();
req.open('GET', 'https://pastebin.com/raw/eQpGm1FL');
req.onload = function() {
    webFilterList = req.responseText.split("\r\n");
};
req.send();

//Filter requests from url
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      return {
          cancel: webFilterList.find(element => details.url.includes(element)) !== undefined
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

//WebRequest filterer for manual domains
chrome.webRequest.onBeforeRequest.addListener(
    ManualDomainBlock,
    {urls: CreateBlockList("reset")},
    ["blocking"]
);

//Listen for updates in manual domain blocking & act
chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if(msg == "RemoveDomain"){
            ResetManualDomainListeners("reset");
        }else if(msg ="Reload"){
            ReloadPage();
        }
    });
});

//Context menu for right click
chrome.contextMenus.create({
    title: "Block this domain", 
    contexts:["link"], 
    onclick: function(clickedLink){
        //Create url format
        var link = new String(new URL(clickedLink.linkUrl).hostname);
        link = "*://*." + link + "/*";
        chrome.storage.sync.get(["Blocked"], function(result){
            if(result["Blocked"].includes(link) == false){
                result["Blocked"].push(link);
                chrome.storage.sync.set(result, function(){
                    //Reset listeners and update list
                    ResetManualDomainListeners(result["Blocked"]);
                    ReloadPage();   
                });

            }
        });
    }
  });

//returns whether to block url from manual domain blocking
function ManualDomainBlock(){
    return {cancel: (manualFilterList.length > 0)};
}

//Creates the blocklist for manual domains blocking
function CreateBlockList(first){
    manualFilterList = [];
    if(first != "reset"){
        //replace with updated values.
        manualFilterList = first;
    }
    else{
        //Full reload on the values.
        chrome.storage.sync.get(["Blocked"], function(result){
            console.log("daqwe");
            if(typeof result["Blocked"] !== 'undefined'){
                manualFilterList = manualFilterList.concat(result["Blocked"]);
            }
        });
    }
    return manualFilterList;
}

//Resets the listener for manual domain blocking
function ResetManualDomainListeners(val){
    chrome.webRequest.onBeforeRequest.removeListener(ManualDomainBlock);
    chrome.webRequest.onBeforeRequest.addListener(
        ManualDomainBlock,
        {urls: CreateBlockList(val)},
        ["blocking"]
    );
}

//Reloads the page;
function ReloadPage(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {reload: true});
    });
}

