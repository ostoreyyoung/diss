var domain = new URL(window.location.href).hostname;
var currentElement;

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

    //Stop selecting
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
        //if nothing stored, make new object else edit old
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