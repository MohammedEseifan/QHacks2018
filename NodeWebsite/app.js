var http = require('http');
var express = require('express');
var ejs = require('ejs');
var lib = require('lib');
var api = require('instagram-node').instagram();
var app = express();

app.set('view engine', 'ejs')
// app.configure(function() {
//   // The usual... 
// });
 
api.use({
  client_id: '0a8f5968db0141b985d4aa9574df3fe1',
  client_secret: 'ea0c617b69374b02ba7ed1dacc240a0f' 
});
 
var redirect_uri = 'http://localhost:3000/handleauth';
 var newRedirect_uri;
exports.authorize_user = function (req, res) {
  newRedirect_uri = redirect_uri + '?username=' + req.query.username;
  res.redirect(api.get_authorization_url(redirect_uri+'?username='+req.query.username));
};
 
exports.handleauth = function(req, res) {
  
  console.log(req.query.code);
  console.log(newRedirect_uri);
  api.authorize_user(req.query.code, newRedirect_uri, function (err, result) {
    console.log(result);
    console.log(err);
    if (err) {
      console.log(err.body);
      // res.send(err.body);
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      // res.send('You made it!!');
    }

    api.use({ access_token: result.access_token });


    lib.TheOnlyMohammed.mediaFilter['@dev']({userID:req.query.username, token:result.access_token }, (err, result) => {
      console.log(err);
      res.send(JSON.stringify(result));
    });
  });

  // ejs.renderFile('views/results.ejs', { username: req.query.username }, null, function (err, str) {
  //   console.log(err);
  //   console.log(str);
  //   res.send(str);
  // });
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
 