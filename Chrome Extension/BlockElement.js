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
    $(document).off("mousemove");
    firstselection = true;
    previousElementBorder = (typeof currentElement.style.border !== 'undefined') ? $(previousElement).css("border", previousElementBorder) : "0px";

})

function createNodeToBeSaved(node){
    var currentElementString = node.cloneNode(true);
    var child = currentElementString.lastElementChild;  
    while (child) { 
        currentElementString.removeChild(child); 
        child = currentElementString.lastElementChild; 
    }
    return currentElementString.outerHTML;
}