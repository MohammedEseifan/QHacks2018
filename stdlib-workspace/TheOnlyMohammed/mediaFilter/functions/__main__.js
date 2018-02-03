/**
* Image 
* @param {string} userID ID of the user to analyse
* @returns {Object}
*/

const lib = require('lib')({token: process.env.STDLIB_LIBRARY_TOKEN});


module.exports = (userID = '', context, callback) => {

	lib.TheOnlyMohammed.mediaFilter['@dev'].imageAnalysis({imageURL: 'https://scontent-yyz1-1.cdninstagram.com/vp/279758741bb68647947e6b57b2b61ae4/5B09F9CD/t51.2885-15/e35/27580280_109049409884860_3828110063231303680_n.jpg'}, (err, result) => {

	if(err){
		callback(null, err);
	}else{
		callback(null, result);
	}  		

	});

};
