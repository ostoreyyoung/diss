document.addEventListener('DOMSubtreeModified', injectCSS);
function injectCSS(){
    if(document.head){
        document.removeEventListener('DOMSubtreeModified', injectCSS);
        var domain = new URL(window.location.href).hostname;
        chrome.storage.sync.get(["Websites"], function(result){
            if(!(jQuery.isEmptyObject(result))){
                if(typeof result["Websites"][domain] !== 'undefined'){
                    var cssString = "";
                    var style = document.createElement("style");
                    for(var key in result["Websites"][domain]){
                        result["Websites"][domain][key].forEach(item => {
                            cssString += item + ", ";
                        });
                    }
                    cssString = cssString.slice(0, -2) + " { display: none !important }"
                    style.innerHTML = cssString;
                    console.log(style);
                    document.head.appendChild(style);
                }
            }
        });
    }
};