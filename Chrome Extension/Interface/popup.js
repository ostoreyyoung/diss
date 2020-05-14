$(document).ready(function(){
    
    //Open a connection that can be used to send messages between scripts.
    var port = chrome.extension.connect({
        name: "Sample Communication"
    });

    //Sends a message telling the current tab to be reloaded
    function ReloadPage(){
        port.postMessage("Reload");
    }
    
    //Initialise settings
    chrome.storage.sync.get(["Settings"], function(result){

        //Init Display Type
        var BlockType = result["Settings"]["BlockType"];
        if(BlockType == "Display"){
            document.getElementById("BlockDisplay").checked = true;
        }else{
            document.getElementById("BlockVisibility").checked = true;
        }

        //Init Whitelist
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

        //Init Default filter
        var UseDefaultFilter = result["Settings"]["useDefaultBlock"];
        if(UseDefaultFilter == false){
            document.getElementById("chk_DefaultFilter").checked = false;
        }
        else{
            document.getElementById("chk_DefaultFilter").checked = true;
        }

        //Init Web filter
        SwapWebFilterStatus(result);

        //Init Web filter url
        document.getElementById("txt_BlockExt").value = result["Settings"]["webBlockURL"];
    });

    //Initialise Blocked Elements table
    chrome.storage.sync.get(["Websites"], function(result){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currentDomain = new URL(tabs[0].url).hostname;
            //Check whether the current page has any stored elements
            if(typeof result["Websites"][currentDomain] !== 'undefined'){
                var allItems = (result["Websites"][currentDomain].classes).concat((result["Websites"][currentDomain].ids));
                document.getElementById("blockedCount").innerHTML = "Blocked Items: " + allItems.length;
                //Create a row for each element in storage
                allItems.forEach(element => {
                    var tr = document.createElement('tr');
                    var td = document.createElement('td');
                    var btn = document.createElement('button');
                    btn.innerHTML = element;
                    //Onclick function to remove elements
                    btn.onclick = function () {
                        //Check to see if its a class or id and remove it.
                        if(this.innerHTML.substr(0,1) != '.'){
                            var index = result["Websites"][currentDomain].ids.indexOf(element);
                            result["Websites"][currentDomain].ids.splice(index,1);
                        }
                        else{
                            var index = result["Websites"][currentDomain].classes.indexOf(element);
                            console.log(element);
                            result["Websites"][currentDomain].classes.splice(index,1);
                        }
                        //Update storage
                        chrome.storage.sync.set(result);

                        //Remove element from the table and update the blocked count
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

    //Initialise blocked domains table
    chrome.storage.sync.get(["Blocked"], function(result){
        document.getElementById("blockedDomainCount").innerHTML = "Blocked Items: " + (result["Blocked"].length);
        //Create a row for each domain in storage
        result["Blocked"].forEach(element => {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            var btn = document.createElement('button');
            btn.innerHTML = element;
            //Onclick function to remove domain
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

    //OnChange handler for #runOnPage
    //Sets whether the element blocking should happen on the current page
    $('#runOnPage').change(function(){
        chrome.storage.sync.get(["Settings"], function(result){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var CurrentDomain = new URL(tabs[0].url).hostname;
                //Swap value in storage
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

    //OnClick handler for #BlockDisplay
    //Sets the block type of elements to "Display"
    $('#BlockDisplay').click(function(){
        chrome.storage.sync.get(["Settings"],function(result){
            result["Settings"]["BlockType"] = "Display";
            chrome.storage.sync.set(result, function(){
                ReloadPage();
            });
        });
    });

    //OnClick handler for #BlockVisibility
    //Sets the block type of elements to "Visibility"
    $('#BlockVisibility').click(function(){
        chrome.storage.sync.get(["Settings"],function(result){
            result["Settings"]["BlockType"] = "Visibility";
            chrome.storage.sync.set(result, function(){
                ReloadPage();
            });
        });
    });

    //OnClick handler for #SelectElement
    //Sends a message to the current tab telling it to begin element selction.
    $('#SelectElement').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {beginSelection: true});
        });
    });

    //OnClick handler for #ResetBlockedSite
    //Resets all of the blocked elements for the current site.
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

    //OnClick handler for #ResetBlockedAll
    //Resets all of the blocked elements for all websites.
    $('#ResetBlockedAll').click(function(){
        chrome.storage.sync.set({"Websites": {}} ,function(){
            window.location.href = "popup.html";
            ReloadPage();
        })
    })

    //OnClick handler for #btn_BlockDomain
    //Adds a custom domain to the domain block list.
    $('#btn_BlockDomain').click(function(event){
        var exp = /(^\*:\/{2}\*\..+\/\*$)/; // *://*.something/*
        var str = document.getElementById("txt_DomainStr");
        $(str).css("border",""); 
        //Check the format using regex.
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

    //OnChange handler for #chk_DefaultFilter
    //Changes the setting that determins whether to use the default block list.
    $('#chk_DefaultFilter').change(function(event){
        chrome.storage.sync.get(["Settings"],function(result){
            var curr = result["Settings"]["useDefaultBlock"];
            result["Settings"]["useDefaultBlock"] = (curr == true ? false : true);
            chrome.storage.sync.set(result, function(){
                port.postMessage("DefaultToggle");
                ReloadPage();
            });
        });
    })

    //OnClick handler for #btn_ToggleExt
    //Changes the value that denotes if an external list should be used.
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

    //Changes the disabled state of elements relating to external domain filters.
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

    //OnClick handler for #btn_SaveExt
    //Sets the url into storage of an external list.
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

