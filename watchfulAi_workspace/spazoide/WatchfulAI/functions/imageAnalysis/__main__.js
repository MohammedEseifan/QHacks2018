/**
* Image 
* @param {string} imageURL The url of the image to analyse
* @returns {Object}
*/

const Clarifai = require('clarifai');


module.exports = (imageURL = 'https://samples.clarifai.com/metro-north.jpg', context, callback) => {

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
});
	// Prediction on general model using video API
	clarifai.models.predict("Insta", imageURL).then( //uses moderation model
	  function(response) {
	  	var scoreNum =0;

	  	for (var i =0; i < response.outputs[0].data.concepts.length; i++) {
	  		if(response.outputs[0].data.concepts[i].name=='good'){
	  			scoreNum = response.outputs[0].data.concepts[i].value;
	  			break;
	  		}
	  	}
	    callback(null, {score: scoreNum, url: imageURL, error: false, errMessage:""});
	  },
	  function(err) {
	     callback(null, {score: scoreNum, url: imageURL, error: true, errMessage:err});
	  });
  

};
