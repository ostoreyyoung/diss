$(document).ready(function(){
    

    //Check the radio button based off of the stored value
    chrome.storage.sync.get(["Settings"], function(result){
        var BlockType = result["Settings"]["BlockType"];
        if(BlockType == "Display"){
            document.getElementById("BlockDisplay").checked = true;
        }else{
            document.getElementById("BlockVisibility").checked = true;
        }
    });

    //Change the stored value to display
    $('#BlockDisplay').click(function(){
        chrome.storage.sync.get(["Settings"],function(result){
            result["Settings"]["BlockType"] = "Display";
            chrome.storage.sync.set(result, function(){
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {reload: true});
                });
            });
        });
    });

    //Change the stored value to display
    $('#BlockVisibility').click(function(){
        chrome.storage.sync.get(["Settings"],function(result){
            result["Settings"]["BlockType"] = "Visibility";
            chrome.storage.sync.set(result, function(){
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {reload: true});
                });
            });
        });
    });

    //Allow element selection - for blocking - to begin on the web page.
    $('#SelectElement').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {beginSelection: true});
        });
    });

    //Reset all of the user selected blocked elements for this site.
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

    //Reset all of the user selected blocked elements for every website.
    $('#ResetBlockedAll').click(function(){
        chrome.storage.sync.set({"Websites": {}} ,function(){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {reload: true});
            });
        })
    })
});