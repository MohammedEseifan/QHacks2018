/**
 * Image 
 * @param {string} userID ID of the user to analyse
 * @param {string} token Instagram user auth_token
 * @returns {Object}
 */

const lib = require('lib');
var api = require('instagram-node').instagram();

var processingCount = 0;
var globalArray = [];
module.exports = (userID = '', token = '', context, callback) => {
	if (userID == '' || token == '') {
		callback(null, {
			error: false,
			errMessage: "Invalid parameters"
		});
		return;
	}

	api.use({
		client_id: '0a8f5968db0141b985d4aa9574df3fe1',
		client_secret: 'eda3c728840e4a94aecee5b82d3c6496',
		access_token: token
	});

	var user_id;
	api.user_search(userID, function(err, users, remaining, limit) {
		console.log("here is search result:")
		console.log(err);
		if (err) {
			console.log(err.body);
		}
		user_id = users[0].id;
		
		api.user_media_recent(user_id, {count: 50}, function(err, medias, pagination, remaining, limit) {
			if (err) {
				callback(null, err);
			}
			var media_type;
			var media_url;
			
			for(var i=0; i<medias.length;i++){
				var media = medias[i];
				media_type = media.type;
				if(media_type == "image"){
					media_url = media.images.standard_resolution.url;
					lib.TheOnlyMohammed.mediaFilter['@dev'].imageAnalysis({imageURL: media_url},  aggregator);
					processingCount++;
				}else if(media_type == "video"){
					media_url = media.videos.standard_resolution.url;
					lib.TheOnlyMohammed.mediaFilter['@dev'].videoAnalysis({videoURL: media_url},  aggregator);
					processingCount++;
				}
			}
			while(processingCount > 0);
			callback(null, globalArray);
		});	
	});	
};

function aggregator(err, result){
	globalArray.push(result);
	processingCount--;
}
