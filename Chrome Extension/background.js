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
});

//Initialise the Web filter block when chrome is opened.
ResetWebBlock();

//Creates listeners used to block requests related to the externally loaded block list.
function ResetWebBlock(){
    chrome.storage.sync.get(["Settings"], function(res){
        if(res["Settings"] !== undefined && res["Settings"]["useWebBlockURL"] === true && res["Settings"]["webBlockURL"] != ""){
            //Send a request and recieve an array of strings
            var req = new XMLHttpRequest();
            req.open('GET', res["Settings"]["webBlockURL"]);
            req.onload = function() {
                webFilterList = [];
                webFilterList = req.responseText.split("\r\n");
            };
            req.send();
            //Reset listeners
            chrome.webRequest.onBeforeRequest.removeListener(WebDomainBlock);
            chrome.webRequest.onBeforeRequest.addListener(
                WebDomainBlock, 
                {urls: ["<all_urls>"]},
                ["blocking"]
            );
        }
        else if(res["Settings"] !== undefined && res["Settings"]["useWebBlockURL"] === false){
            chrome.webRequest.onBeforeRequest.removeListener(WebDomainBlock);
        }
    })
}

//WebRequest filterer for manual domains
chrome.storage.sync.get(null, function(res){
    manualFilterList = res["Blocked"];
    if(manualFilterList !== undefined){
        if(res["Settings"]["useDefaultBlock"] === true){
            manualFilterList.concat(blocked);
        }
        chrome.webRequest.onBeforeRequest.addListener(
            ManualDomainBlock,
            {urls: manualFilterList},
            ["blocking"]
        );
    }
});

//Listens for incoming messages and starts functions accordingly.
chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if(msg.Reset !== undefined || msg.Blocked !== undefined){
            ResetManualDomainListeners(msg);
        }
        else if(msg == "Reload"){
            ReloadPage();
        }
        else if(msg == "WebFilterUpdate"){
            ResetWebBlock();
        }
        else if(msg == "DefaultToggle"){
            ResetManualDomainListeners("text");
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
                    ResetManualDomainListeners(result);
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

//returns whether the url should be blocked
//If the url contains a string loaded from the external block list.
var WebDomainBlock = function(details) {
    return {cancel: webFilterList.find(element => details.url.includes(element)) !== undefined}
}

//Creates the blocklist for manual domains blocking
//Resets the listener for manual domain blocking
function ResetManualDomainListeners(obj){
    chrome.storage.sync.get(null, function(res){
        manualFilterList = [];
        manualFilterList = res["Blocked"];
        if(res["Settings"]["useDefaultBlock"] === true){
            manualFilterList = manualFilterList.concat(blocked);
        }
    
        chrome.webRequest.onBeforeRequest.removeListener(ManualDomainBlock);
        chrome.webRequest.onBeforeRequest.addListener(
            ManualDomainBlock,
            {urls: manualFilterList},
            ["blocking"]
        );
    })
}

//Reloads the page;
function ReloadPage(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {reload: true});
    });
}