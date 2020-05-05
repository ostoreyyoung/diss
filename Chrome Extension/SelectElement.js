var domain = new URL(window.location.href).hostname;
var currentElement;

//Listen for a message from popup.js
chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    if (request.beginSelection == true){

        $("<style type='text/css'> a{pointer-events:none;} </style>").appendTo("head");

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
    $(document).click(function(event){
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
            classesToBlock += "." + CSS.escape(element);
        });
    }
    idToBlock = (currentElement.id == "") ? "" : ("#" + CSS.escape(currentElement.id));

    //storage
    chrome.storage.sync.get(["Websites"],function(result){
        //if nothing stored, make new object else edit old
        if(typeof result["Websites"][domain] === 'undefined'){
            result["Websites"][domain] = {classes:[], ids:[]}
            if(classesToBlock != ""){
                result["Websites"][domain].classes.push(classesToBlock);
            }
            if(idToBlock != ""){
                result["Websites"][domain].ids.push(idToBlock);
            }
            chrome.storage.sync.set(result);
        }else{
            if(classesToBlock != "" && result["Websites"][domain].classes.includes(classesToBlock) == false){
                result["Websites"][domain].classes.push(classesToBlock);
            }
            if(idToBlock != "" && result["Websites"][domain].ids.includes(idToBlock) == false){
                result["Websites"][domain].ids.push(idToBlock);
            }
            chrome.storage.sync.set(result);
        }
    });
}