chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message == "text"){
          window.alert("gotit");
      }
});
