$(document).ready(function(){
    
    function ReloadPage(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {reload: true});
        });
    }
    

    //Initialise settings
    chrome.storage.sync.get(["Settings"], function(result){
        //Display type
        var BlockType = result["Settings"]["BlockType"];
        if(BlockType == "Display"){
            document.getElementById("BlockDisplay").checked = true;
        }else{
            document.getElementById("BlockVisibility").checked = true;
        }

        //whitelist
        var Whitelist = result["Settings"]["Whitelist"];
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var CurrentDomain = new URL(tabs[0].url).hostname;
            if(Whitelist.includes(CurrentDomain)){
                document.getElementById("runOnPage").checked = false;
            }
            else{
                document.getElementById("runOnPage").checked = true;
            }
        });

    });

    chrome.storage.sync.get(["Websites"], function(result){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currentDomain = new URL(tabs[0].url).hostname;
            if(typeof result["Websites"][currentDomain] !== 'undefined'){
                var allItems = (result["Websites"][currentDomain].classes).concat((result["Websites"][currentDomain].ids));
                document.getElementById("blockedCount").innerHTML = "Blocked Items: " + allItems.length;
                allItems.forEach(element => {
                    var tr = document.createElement('tr');
                    var td = document.createElement('td');
                    var btn = document.createElement('button');
                    btn.innerHTML = element;
                    btn.onclick = function () {
                        console.log(result);
                        if(this.innerHTML.substr(0,1) != '.'){
                            var index = result["Websites"][currentDomain].ids.indexOf(element);
                            result["Websites"][currentDomain].ids.splice(index,1);
                        }
                        else{
                            var index = result["Websites"][currentDomain].classes.indexOf(element);
                            console.log(element);
                            result["Websites"][currentDomain].classes.splice(index,1);
                        }
                        console.log(result);
                        chrome.storage.sync.set(result);


                        var currRow = this.parentElement.parentElement;
                        this.parentElement.parentElement.parentElement.removeChild(currRow);
                        allItems = (result["Websites"][currentDomain].classes).concat((result["Websites"][currentDomain].ids));
                        document.getElementById("blockedCount").innerHTML = "Blocked Items: " + (allItems.length);
                        ReloadPage();
                    };
                    td.appendChild(btn);
                    tr.appendChild(td);
                    document.getElementById("manuallyblocked").appendChild(tr);
                });
            }
        });
    });





    //Adds and removes pages from the whitelist
    $('#runOnPage').change(function(){
        chrome.storage.sync.get(["Settings"], function(result){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var CurrentDomain = new URL(tabs[0].url).hostname;
                console.log("here");
                if(document.getElementById("runOnPage").checked){
                    var index = result["Settings"]["Whitelist"].indexOf(CurrentDomain);
                    result["Settings"]["Whitelist"].splice(index, 1);
                    chrome.storage.sync.set(result, function(){
                        ReloadPage();
                    });
                }else{
                    if(!result["Settings"]["Whitelist"].includes(CurrentDomain)){
                        result["Settings"]["Whitelist"].push(CurrentDomain);
                        chrome.storage.sync.set(result, function(){
                            ReloadPage();
                        });
                    }
                }
            });
        });
    });

    //Change the stored value to display for display type
    $('#BlockDisplay').click(function(){
        chrome.storage.sync.get(["Settings"],function(result){
            result["Settings"]["BlockType"] = "Display";
            chrome.storage.sync.set(result, function(){
                ReloadPage();
            });
        });
    });

    //Change the stored value to display for display type
    $('#BlockVisibility').click(function(){
        chrome.storage.sync.get(["Settings"],function(result){
            result["Settings"]["BlockType"] = "Visibility";
            chrome.storage.sync.set(result, function(){
                ReloadPage();
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
                    ReloadPage();
                });
            })
        }); 
    })

    //Reset all of the user selected blocked elements for every website.
    $('#ResetBlockedAll').click(function(){
        chrome.storage.sync.set({"Websites": {}} ,function(){
            ReloadPage();
        })
    })
});