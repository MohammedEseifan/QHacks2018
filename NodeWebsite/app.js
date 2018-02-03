var http = require('http');
var express = require('express');
var ejs = require('ejs');
var api = require('instagram-node').instagram();
var app = express();

app.set('view engine', 'ejs')
// app.configure(function() {
//   // The usual... 
// });
 
api.use({
  client_id: '0a8f5968db0141b985d4aa9574df3fe1',
  client_secret: '7820d49f29cb436caae240e4847c1e78 ' 
});
 
var redirect_uri = 'http://localhost:3000/handleauth';
 var newRedirect_uri;
exports.authorize_user = function (req, res) {
  newRedirect_uri = redirect_uri + '?username=' + req.query.username;
  res.redirect(api.get_authorization_url(redirect_uri+'?username='+req.query.username));
};
 
exports.handleauth = function(req, res) {
  
  console.log(req.query.code);
  api.authorize_user(req.query.code, newRedirect_uri, function (err, result) {
    console.log(result);
    if (err) {
      console.log(err.body);
      // res.send(err.body);
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      // res.send('You made it!!');
    }

    var instaName = req.query.username;
    api.use({ access_token: result.access_token });
    api.user_search(instaName, function (err, users, remaining, limit) {
      console.log("here is search result:")
      if (err) {
        console.log(err.body);
       
      } 
      
      var user_id = users[0].id;
      // console.log(user_id);
      res.redirect("https://api.instagram.com/v1/users/"+user_id+"/follows?access_token="+result.access_token);
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
  });

  ejs.renderFile('views/results.ejs', { username: req.query.username }, null, function (err, str) {
    console.log(err);
    console.log(str);
    res.send(str);
  });
};

exports.index = function(req,res){
  res.render('index');
}
 
// This is where you would initially send users to authorize 
app.get('/authorize_user', exports.authorize_user);
// This is your redirect URI 
app.get('/handleauth', exports.handleauth);

app.get('/', exports.index);
 
http.createServer(app).listen(3000, function(){
  console.log("Express server listening on port " + 3000);
});
 