$(document).ready(function(){
    
    //Create connectionbetween popup.js and background
    var port = chrome.extension.connect({
        name: "Sample Communication"
    });


    function ReloadPage(){
        port.postMessage("Reload");
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

        //Default filter
        var UseDefaultFilter = result["Settings"]["useDefaultBlock"];
        if(UseDefaultFilter == false){
            document.getElementById("chk_DefaultFilter").checked = false;
        }
        else{
            document.getElementById("chk_DefaultFilter").checked = true;
        }

        //Web Filter
        SwapWebFilterStatus(result);

        //Web filter url
        document.getElementById("txt_BlockExt").value = result["Settings"]["webBlockURL"];
        


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

    //Creates the table for the domains blocked, adds onlcick to handle removal
    chrome.storage.sync.get(["Blocked"], function(result){
        document.getElementById("blockedDomainCount").innerHTML = "Blocked Items: " + (result["Blocked"].length);
        result["Blocked"].forEach(element => {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            var btn = document.createElement('button');
            btn.innerHTML = element;
            btn.onclick = function () {
                var index = result["Blocked"].indexOf(element);
                result["Blocked"].splice(index,1);
                var currRow = this.parentElement.parentElement;
                this.parentElement.parentElement.parentElement.removeChild(currRow);
                //Refresh listeners on background page
                chrome.storage.sync.set(result, function(){
                    port.postMessage({Reset : result["Blocked"]});
                });
                document.getElementById("blockedDomainCount").innerHTML = "Blocked Items: " + (result["Blocked"].length);

            }
            td.appendChild(btn);
            tr.appendChild(td);
            document.getElementById("manuallyblockeddomains").appendChild(tr);
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
                    window.location.href = "popup.html";
                    ReloadPage();
                });
            })
        }); 
    })

    //Reset all of the user selected blocked elements for every website.
    $('#ResetBlockedAll').click(function(){
        chrome.storage.sync.set({"Websites": {}} ,function(){
            window.location.href = "popup.html";
            ReloadPage();
        })
    })

    $('#btn_BlockDomain').click(function(event){
        var exp = /(^\*:\/{2}\*\..+\/\*$)/;
        var str = document.getElementById("txt_DomainStr");
        $(str).css("border",""); 
        if(exp.test(str.value)){
            $(str).css("border","2px solid green"); 
            chrome.storage.sync.get(["Blocked"], function(result){
                result["Blocked"].push(str.value);
                chrome.storage.sync.set(result, function(){
                    $(str).val("");
                    port.postMessage({Reset : result["Blocked"]});
                    ReloadPage();
                });
            });
        }
        else{
            $(str).css("border","2px solid red"); 
        }
    });

    $('#chk_DefaultFilter').change(function(event){
        chrome.storage.sync.get(["Settings"],function(result){
            var curr = result["Settings"]["useDefaultBlock"];
            result["Settings"]["useDefaultBlock"] = (curr == true ? false : true);
            chrome.storage.sync.set(result, function(){
                ReloadPage();
            });
        });
    })

    $('#btn_ToggleExt').click(function(){
        chrome.storage.sync.get(["Settings"],function(result){
            var curr = result["Settings"]["useWebBlockURL"];
            result["Settings"]["useWebBlockURL"] = (curr == true ? false : true);
            chrome.storage.sync.set(result, function(){
                port.postMessage("WebFilterUpdate");
                ReloadPage();
            });
            SwapWebFilterStatus(result);
        });
    })

    function SwapWebFilterStatus(result){
        var UseWebBlockURL = result["Settings"]["useWebBlockURL"];
        if(UseWebBlockURL == false){
            document.getElementById("txt_BlockExt").disabled = true;
            document.getElementById("btn_ToggleExt").innerHTML = "Enable Ext";
            document.getElementById("btn_SaveExt").disabled = true;
        }else{
            document.getElementById("txt_BlockExt").disabled = false;
            document.getElementById("btn_ToggleExt").innerHTML = "Disable Ext";
            document.getElementById("btn_SaveExt").disabled = false;
        }
    }

    $("#btn_SaveExt").click(function(){
        chrome.storage.sync.get(["Settings"],function(result){
            result["Settings"]["webBlockURL"] = document.getElementById("txt_BlockExt").value;
            chrome.storage.sync.set(result, function(){
                port.postMessage("WebFilterUpdate");
                ReloadPage();
            });
        });
    })


});

