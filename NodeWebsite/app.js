var http = require('http');
var express = require('express');
var ejs = require('ejs');
var lib = require('lib');
var api = require('instagram-node').instagram();
var app = express();
var request = require('request');



app.set('view engine', 'ejs')
// app.configure(function() {
//   // The usual... 
// });
 
api.use({
  client_id: '0a8f5968db0141b985d4aa9574df3fe1',
  client_secret: 'f092efa929a34ce3a5300661210a43b6' 
});
 
var redirect_uri = 'http://localhost:3000/handleauth';
var newRedirect_uri;
var access_token=null;
var calculatedScores = [];


function parseFollowers(data){
  var jsonData = JSON.parse(data).following;
  for (var i = 0; i < jsonData.length; i++) {
    var name = jsonData[i].name;
    console.log("Sending request for "+name);
    lib.TheOnlyMohammed.mediaFilter['@dev']({ userID: name, token: access_token }, (err, result) => {

      if (result) {
        for (var k in result) {
          if (k == 'error') {
            return;
          }
          result[k] = Object.values(result[k]);
          name = k;
        }
        console.log("Got results for " + name);
        console.log(result);
        calculatedScores.push(result);
      }
    });
  }
  
}



exports.authorize_user = function (req, res) {
  // if (access_token) {
  //   res.redirect("/handleauth");
  //   return;
  // }
  newRedirect_uri = redirect_uri + '?username=' + req.query.username;
  res.redirect(api.get_authorization_url(newRedirect_uri, {scope: ['public_content']}));
};
 
exports.handleauth = function(req, res) {
  // if (access_token) {
  //   isLoggedIn(req,res);
  //   return;
  // }

  api.authorize_user(req.query.code, newRedirect_uri, function (err, result) {
   
    if (err) {
      console.log(err.body);
    } else {
      console.log('Yay! Access token is ' + result.access_token);
    }

    
    api.use({ access_token: result.access_token });
    access_token= result.access_token;
    lib.TheOnlyMohammed.mediaFilter['@dev']({ userID: "elloimraj", token: access_token }, (err, result) => {

      if (result) {
        // for (var k in result) {
        //   if (k == 'error') {
        //     return;
        //   }
        //   result[k] = Object.values(result[k]);
        //   name = k;
        // }
        console.log("Got results ");
        console.log(result);
        calculatedScores.push(result);
      }
    });
    // isLoggedIn(req, res);
  });
};

function isLoggedIn(req, res){
  var username = req.query.username;
    request({
          uri: 'https://www.parsehub.com/api/v2/projects/tETfMCbfN8Md/run',
          method: 'POST',
          form: {
            api_key: "tr0EdoMBubaDWcHYw0C7taFd",
            start_url: "https://www.instagram.com",
            start_template: "main_template",
            start_value_override: JSON.stringify({user: username}),
            send_email: "0"
          }
        }, function (err, resp, body) {
          console.log("running");
          console.log(body);
          var runID = JSON.parse(body).run_token;
          setTimeout(checkRun, 20000, runID);

        });

      
  ejs.renderFile('views/results.ejs', { username: req.query.username }, null, function (err, str) {
    console.log(err);
    console.log(str);
    res.send(str);
  });
  }

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
 
function checkRun(runID){
  console.log("checking");
  console.log(runID);
  request({
    uri: 'https://www.parsehub.com/api/v2/runs/'+runID,
    method: 'GET',
    qs: {
      api_key: "tr0EdoMBubaDWcHYw0C7taFd"
    }
  }, function (err, resp, body) {
    
    console.log(body);
    var body = JSON.parse(body)
    var doneRunning = body.data_ready;
    if(doneRunning){
      runIsDone(runID);
    }else{
      setTimeout(checkRun, 5000, runID);
    }
  });
}

function runIsDone(runID){

  request({
    uri: 'https://www.parsehub.com/api/v2/runs/'+runID+'/data',
    method: 'GET',
    gzip: true,
    qs: {
      api_key: "tr0EdoMBubaDWcHYw0C7taFd"
    }
  }, function (err, resp, body) {
    console.log(body);
    parseFollowers(body);
  });

}