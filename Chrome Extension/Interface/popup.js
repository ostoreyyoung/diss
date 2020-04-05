$(document).ready(function(){
    $('#BtnSelectElement').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {beginSelection: true, url: tabs[0].url});
        });
    });
});