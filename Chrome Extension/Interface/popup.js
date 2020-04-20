$(document).ready(function(){
    
    $('#SelectElement').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {beginSelection: true});
        });
    });

    $('#ResetBlockedSite').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.storage.sync.get(["Websites"], function(result){
                delete result["Websites"][String(new URL(tabs[0].url).hostname)];
                chrome.storage.sync.set(result, function(){
                    chrome.tabs.sendMessage(tabs[0].id, {reload: true});
                });
            })
        }); 
    })

    $('#ResetBlockedAll').click(function(){
        chrome.storage.sync.set({"Websites": {}} ,function(){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {reload: true});
            });
        })
    })
});