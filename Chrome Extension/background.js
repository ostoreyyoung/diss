var x = new XMLHttpRequest();
var webFilterList = [];

x.open('GET', 'https://pastebin.com/raw/eQpGm1FL');
x.onload = function() {
    webFilterList = x.responseText.split("\r\n");
};
x.send();

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      return {cancel: webFilterList.find(element => details.url.includes(element)) !== undefined}
    },
    {urls: ["<all_urls>"]},
    ["blocking"]);


var DomainsToBlock = [];

chrome.runtime.onInstalled.addListener(function(){
    var storage = {};
    storage["Websites"] = {};
    storage["Settings"] = {"BlockType" : "Visibility"};
    storage["Settings"]["Whitelist"] = [];
    storage["Blocked"] = [];
    chrome.storage.sync.set(storage);

});

CreateBlockList();
//Creates the blocklist from storage & file;
function CreateBlockList(){
    DomainsToBlock = [];
    DomainsToBlock.push("*://*.www.123123123.abcabcabc.com/*"); // need one item in there for sure
    DomainsToBlock = DomainsToBlock.concat(blocked);
    chrome.storage.sync.get(["Blocked"], function(result){

        //Check to make sure it's run on install yet
        if(typeof result["Blocked"] !== 'undefined'){
            DomainsToBlock = DomainsToBlock.concat(result["Blocked"]);
        }

        //Add initial listener
        chrome.webRequest.onBeforeRequest.addListener(
            DomainBlock,
            {urls: DomainsToBlock},
            ["blocking"]
        );
    });
}



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
                    chrome.webRequest.onBeforeRequest.removeListener(DomainBlock);
                    CreateBlockList();
                    chrome.webRequest.onBeforeRequest.addListener(
                        DomainBlock,
                        {urls: DomainsToBlock},
                        ["blocking"]
                    );
                    ReloadPage();  
                });

            }
        });
    }
  });

  

//callback, needed for attatch and detatch
function DomainBlock(){
    return {cancel: true };
}

function ReloadPage(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {reload: true});
    });
}

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        console.log("found");
        chrome.webRequest.onBeforeRequest.removeListener(DomainBlock);
        CreateBlockList();
        chrome.webRequest.onBeforeRequest.addListener(
            DomainBlock,
            {urls: DomainsToBlock},
            ["blocking"]
        );
        ReloadPage();
    });
})



