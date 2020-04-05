var pageURL = "";
var previousElementBorder;
var previousElement;
var currentElement;
var firstselection = true;


//Listen for a message from popup.js
chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    if (request.beginSelection == true){
        pageURL = request.url;

        //Start selecting elements
        $(document).mousemove(function(mouse){
            currentElement = mouse.target;
            //set variables that are undefined
            if(firstselection){
                previousElement = currentElement;
                previousElementBorder = (typeof currentElement.style.border !== 'undefined') ? currentElement.style.border : "0px";
                firstselection = false;
            }
            //Apply border to new elemnt if moused over
            else{
                if(typeof currentElement.style.border != 'undefined'){
                    if(currentElement.style.border != "2px dotted tomato"){
                        previousElement.style.border = previousElementBorder;
                        //previousElement.style.filter = "none";
                        //$(previousElement).css("margin", "+=2px");
                        previousElement = currentElement;
                        previousElementBorder = (typeof currentElement.style.border !== 'undefined') ? previousElement.style.border : "0px";
                        currentElement.style.border = "2px dotted tomato";
                        //currentElement.style.filter = "blur(2px)";
                        //$(currentElement).css("margin", "-=2px");
                    }
                }
            } 
        }); 
    }
});

//Stop selecting elements
$(document).click(function(){
    //Reset things
    $(document).off("mousemove");
    $(document).off("click");
    firstselection = true;
    try{
        currentElement.removeAttribute("style");
    }
    catch{}

    StoreElement();
})

function StoreElement(){
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
}

function createNodeToBeSaved(node){
    var currentElementString = node.cloneNode(true);
    var child = currentElementString.lastElementChild;  
    while (child) { 
        currentElementString.removeChild(child); 
        child = currentElementString.lastElementChild; 
    }
    $(currentElementString).removeAttr("style");
    return JSON.stringify(currentElementString.outerHTML);
}