/* var overlay =  $('<div></div>',{id: "8b29f35f-6cc6"});
$(overlay).css(({
    position: 'absolute',
    display:'block',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(55,22,124,0.5)',
    zindex: '1000000',
    cursor: 'pointer'}));

var CurrentItem;
$('body').mousemove(function(evt){
    CurrentItem = evt.target
});

            $(document).click(function(){
                isSelecting = false;
                clearInterval(selecting);
            })

            selecting = setInterval(function(){
                $("#8b29f35f-6cc6").remove();
                currentElement = CurrentItem;
                $(currentElement).append(overlay);

                */


var previousElementBorder;
var previousElement;
var firstselection = true;

//Listen for a message from popup.js
chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    if (request.beginSelection == true){
        //Stop selecting elements
        $(document).click(function(){
            $(document).off("mousemove");
        })
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
                        $(previousElement).css("margin", "+=2px");
                        previousElement = currentElement;
                        previousElementBorder = (typeof currentElement.style.border !== 'undefined') ? previousElement.style.border : "0px";
                        currentElement.style.border = "2px dotted tomato";
                        //currentElement.style.filter = "blur(2px)";
                        $(currentElement).css("margin", "-=2px");
                    }
                }
            } 
        }); 
    }
});