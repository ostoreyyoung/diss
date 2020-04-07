var domain = new URL(window.location.href).hostname;
chrome.storage.sync.get(["Websites"], function(result){
    if(!(jQuery.isEmptyObject(result))){
        if(typeof result["Websites"][domain] !== 'undefined')
            for(var key in result["Websites"][domain]){
                result["Websites"][domain][key].forEach(item => {
                $(item).css("display","none");
            });
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.reload == true)
        location.reload();   
});