/**
* Image 
* @param {string} userID ID of the user to analyse
* @param {Object} api api object
* @returns {Object}
*/

const lib = require('lib')({token: process.env.STDLIB_LIBRARY_TOKEN});


module.exports = (userID = '', api=null, context, callback) => {
	if(userID=='' || api==null){
		callback(null, { error: false, errMessage:"Invalid parameters"});
		return;
	}

	api.user_search(instaName, function (err, users, remaining, limit) {
      console.log("here is search result:")
      console.log(err);
      if (err) {
        console.log(err.body);
      } 
      
      var user_id = users[0].id;
      // console.log(user_id)
      api.user_follows(user_id, function (err, users, pagination, remaining, limit) {
        if (err) {
          console.log(err.body);
        }
        console.log(users);
        console.log(err);
        console.log(pagination);
        console.log(remaining);
        console.log(limit);
        while(1) {
          var num = users.length;
          for (var i = 0; i < num; i++) {
            console.log(users[i]);
            api.user_media_recent(users[i].id, {count: 50}, function(err, medias, pagination, remaining, limit) {
              console.log(medias);
            });
          }
          if (pagination.next) {
            pagination.next();
          }else{
            break;
          }
        }

      });
    });


	lib.TheOnlyMohammed.mediaFilter['@dev'].imageAnalysis({imageURL: 'https://scontent-yyz1-1.cdninstagram.com/vp/279758741bb68647947e6b57b2b61ae4/5B09F9CD/t51.2885-15/e35/27580280_109049409884860_3828110063231303680_n.jpg'}, (err, result) => {

	if(err){
		callback(null, err);
	}else{
		callback(null, result);
	}  		

	});

};
