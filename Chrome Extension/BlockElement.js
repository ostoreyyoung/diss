var domain = new URL(window.location.href).hostname;
chrome.storage.sync.get([domain], function(result){
    for(var key in result[domain]){
        result[domain][key].forEach(item => {
            $(item).css("display","none");
        });
    }
});