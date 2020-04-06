var domain = new URL(window.location.href).hostname;
var currentElement;

chrome.storage.sync.get([domain], function(items){
    console.log(items);
});


//Listen for a message from popup.js
chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    if (request.beginSelection == true){
        //Start selecting elements
        $(document).mousemove(function(mouse){
            $(currentElement).removeAttr("style");
            var currentmouseover = mouse.target;
            while(currentmouseover.nodeName != "BODY" && (currentmouseover.id == "" && typeof $(currentmouseover).attr("class") === 'undefined' )){
                currentmouseover = currentmouseover.parentNode;
            }
            currentElement = currentmouseover;
            $(currentElement).css("border", "2px dotted tomato");

        }); 
    }

    $(document).click(function(){
        //Reset things
        $(document).off("mousemove");
        $(document).off("click");
        $(currentElement).removeAttr("style");
        
    
        StoreElements();
        location.reload();
    })
});



function StoreElements(){
    //storage prep
    var classesToBlock = "";
    var idToBlock = "";
    if($(currentElement).attr("class") !== 'undefined'){
        $(currentElement).prop("classList").forEach(element => {
            classesToBlock += "." + element;
        });
    }
    idToBlock = (currentElement.id == "") ? "" : ("#" + currentElement.id);
    var Data = {};

    //storage
    chrome.storage.sync.get([domain],function(result){
        if(jQuery.isEmptyObject(result)){
            Data[domain] = {classes:[], ids:[]}
            if(classesToBlock != ""){
                Data[domain].classes.push(classesToBlock);
            }
            if(idToBlock != ""){
                Data[domain].ids.push(idToBlock);
            }
            chrome.storage.sync.set(Data, function(){
                console.log("added new entry");
            });
        }else{
            if(classesToBlock != "" && result[domain].classes.includes(classesToBlock) == false){
                result[domain].classes.push(classesToBlock);
            }
            if(idToBlock != "" && result[domain].ids.includes(idToBlock) == false){
                result[domain].ids.push(idToBlock);
            }
            chrome.storage.sync.set(result, function(){
                console.log("updated entries");
            });
        }

    });

}

/*function StoreElement(){
    //Cut domain from url and make json object
    var domain = String(new URL(pageURL).hostname);
    var toStore = {};
    var nodeToSave = createNodeToBeSaved(currentElement);
    toStore[domain] = nodeToSave;

    //check if any elements already stored
    chrome.storage.sync.get([domain],function(items){
        if(jQuery.isEmptyObject(items)){

            chrome.storage.sync.set(toStore, function(){
                window.alert("Now Blocking:\n" + nodeToSave);
            });
        }else{
            var newArr = [];
            if(Array.isArray(items[domain])){
                items[domain].forEach(element => {
                    newArr.push(element);
                }); 
            }else{
                newArr.push(items[domain]);
            }
            newArr.push(nodeToSave);
            toStore[domain] = newArr;
            chrome.storage.sync.set(toStore, function(){
                window.alert("Now Blocking:\n" + nodeToSave);
            });

        }
        chrome.storage.sync.get([domain], function(items){
            console.log(JSON.parse(items[domain]));
        });
    });
}*/