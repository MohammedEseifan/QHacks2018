/**
* Image 
* @param {string} videoURL The url of the video to analyse
* @returns {Object}
*/

const Clarifai = require('clarifai');


module.exports = (videoURL = 'https://scontent.cdninstagram.com/vp/58be53cd4f920b500f76fc2cf5a57bb1/5A7885D5/t50.2886-16/27679543_1777768062253864_8352405394715768525_n.mp4', context, callback) => {

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
});
	// Prediction on general model using video API
	clarifai.models.predict("e9576d86d2004ed1a38ba0cf39ecb4b1", videoURL, {video:true}).then( //uses nsfw model
	  function(response){
	  	var frame_count = 0;
	  	var sfw_score = 0;
	  	var nsfw_score = 0;
	  	for(frame in response.outputs.data.frames){
	   		sfw_score = sfw_score + frame.data.concepts[0].value;
	   		nsfw_score = nsfw_score + frame.data.concepts[1].value;
	   		frame_count++;
	  	}
	  	sfw_score = sfw_score/frame_count;
	  	nsfw_score = nsfw_score/frame_count;

	  	callback(null, {score: sfw_score, url:videoURL, error: false, errMessage:""}); 
	  },
	  function(err) {
	     callback(null, {score: sfw_score, url:videoURL, error: true, errMessage:err});
	  });
  

};
