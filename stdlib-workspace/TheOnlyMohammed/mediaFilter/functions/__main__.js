/**
* A basic Hello World function
* @param {string} imageURL Who you're saying hello to
* @returns {string}
*/

const Clarifai = require('clarifai');


module.exports = (imageURL = 'https://samples.clarifai.com/metro-north.jpg', context, callback) => {

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
});
	// Prediction on general model using video API
	clarifai.models.predict(Clarifai.MODERATION_MODEL, imageURL).then(
	  function(response) {
	    callback(null, JSON.stringify(response));
	  },
	  function(err) {
	     callback(null, JSON.stringify(err));
	  });
  

};
