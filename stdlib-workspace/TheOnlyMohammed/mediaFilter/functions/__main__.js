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
var globalDict = {};
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

		api.user_media_recent(user_id, {
			count: 50
		}, function(err, medias, pagination, remaining, limit) {
			if (err) {
				callback(null, err);
			}
			var media_type;
			var media_url;

			for (var i = 0; i < medias.length; i++) {
				var media = medias[i];
				// callback(null, media);
				// return
				media_type = media.type;

				if (media_type == "image") {
					media_url = media.images.standard_resolution.url;
					lib.TheOnlyMohammed.mediaFilter['@dev'].imageAnalysis({
						imageURL: media_url
					}, function(err, result) {
						globalDict[result.url] = result;
						processingCount--;
					});
					processingCount++;
				} else if (media_type == "video") {
					media_url = media.videos.standard_resolution.url;
					lib.TheOnlyMohammed.mediaFilter['@dev'].videoAnalysis({
						videoURL: media_url
					}, function(err, result) {
						globalDict[result.url] = result;
						processingCount--;
					});
					processingCount++;
				}
			}

			setTimeout(checkIfDone, 2000, callback, userID);
		});
	});
};


function checkIfDone(callback, userID) {
	if (processingCount == 0) {
		for (var key in globalDict) {
			globalArray.push(globalDict[key]);
		}
		var a = {}
		a[userID] = globalDict;
		callback(null, a);
	} else {
		setTimeout(checkIfDone, 1000, callback, userID);
	}
}