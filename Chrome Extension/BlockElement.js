var siteaddress = window.location.href;
var domain = String(new URL(siteaddress).hostname);
chrome.storage.sync.get([domain],function(items){
    if(!jQuery.isEmptyObject(items)){
        if(Array.isArray(items[domain])){
            items[domain].forEach(element => {
                var p = findByString(JSON.parse(element));
                $(p).remove();
            });
        }else{
            var p = findByString(JSON.parse(items[domain]));
            $(p).remove();
        }
    }
});

function findByString(str){
    var tag = str.match(/^<(\S+)/)[1];
    var attrs = str.match(/([^\s="]+="[^"]+")|([^\s=']+='[^']+')/g);
    var q = tag+attrs.map(t => '['+t+']').join('');
    return document.querySelector(q);
  }