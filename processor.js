const fs = require("fs");
const login = require("facebook-chat-api");
const request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    api.setOptions({
        listenEvents: true
    });

    api.listen((err, event) => {

        console.log(event.type);

        api.handleMessageRequest(event.threadID, true, (err) => {
            if(err) return console.log(err)

    	var senderID = event.senderID;

    	api.getUserInfo(senderID, (err, ret) => {
    		if(err) return console.error(err);

    		for(var prop in ret) {
    			if(ret.hasOwnProperty(prop)) {
    				var toSend = "Salut " + ret[prop].name + ", misto poza <3";
    				api.sendMessage(toSend, event.threadID);

    				var imgName = "./pictures/";
    				imgName = imgName + ret[prop].name + "- profile pic.jpg";
    				
    				download("http://graph.facebook.com/" + senderID +  "/picture?type=large", imgName, function() {
    					toSend = {
    						attachment: fs.createReadStream(imgName)
    					};
    					api.sendMessage(toSend, event.threadID);
    				});
    			}
    		}
    	})
    });
    });
});