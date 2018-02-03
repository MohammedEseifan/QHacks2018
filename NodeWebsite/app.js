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
  client_secret: 'bb11d5ff4fda4b2390e9bdd286b63439 ' 
});
 
var redirect_uri = 'http://localhost:3000/handleauth';
 
exports.authorize_user = function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri+'?username='+req.query.username));
};
 
exports.handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send(err.body);
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
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
 