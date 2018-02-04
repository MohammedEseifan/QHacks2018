var http = require('http')
var express = require('express')
var ejs = require('ejs')
var lib = require('lib')
var api = require('instagram-node').instagram()
var app = express()
var request = require('request')

app.set('view engine', 'ejs')
// app.configure(function() {
//   // The usual... 
// })

api.use({
  client_id: '0a8f5968db0141b985d4aa9574df3fe1',
  client_secret: 'f092efa929a34ce3a5300661210a43b6'
})

var redirect_uri = 'http://localhost:3000/handleauth'
var newRedirect_uri
var access_token = null
var calculatedScores = []

function parseFollowers (data) {
  var jsonData = JSON.parse(data).following
  var tempcounter = jsonData.length
  var userCounter = {}
  var userBuffer = {}
  for (var i = 0; i < jsonData.length; i++) {
    var name = jsonData[i].name
    userCounter[name] = 2
    userBuffer[name] = null
    console.log('Sending request for ' + name)
    lib.TheOnlyMohammed.mediaFilter['@dev']({ userID: name, token: access_token, firsthalf: true }, (err, result) => {
      tempcounter = tempcounter - 0.5

      console.log(JSON.stringify(result))
      if (result && !result.error) {
        if (result.name == undefined) {
        }else {
          console.log('Got Result From: ' + result.name)
          userCounter[result.name] = userCounter[result.name] - 1

          if (userBuffer[result.name] == null) {
            userBuffer[result.name] = result
          } else {
            console.log(JSON.stringify(userBuffer))
            userBuffer[result.name] = userBuffer[result.name].data.concat(result.data)
          }
        }
      }
      if (tempcounter == 0) {
        calculatedScores = userBuffer
        temp()
      }
      console.log(tempcounter)
    })
    lib.TheOnlyMohammed.mediaFilter['@dev']({ userID: name, token: access_token, firsthalf: false }, (err, result) => {
      tempcounter = tempcounter - 0.5
      console.log(JSON.stringify(result))
      if (result && !result.error) {
        if (result.name == undefined) {
        } else {
          console.log('Got Result From: ' + result.name)
          userCounter[result.name] = userCounter[result.name] - 1

          if (userBuffer[result.name] == null) {
            userBuffer[result.name] = result
          } else {
            console.log(JSON.stringify(userBuffer))
            userBuffer[result.name] = userBuffer[result.name].data.concat(result.data)
          }
        }
      }
      if (tempcounter == 0) {
        calculatedScores = userBuffer
        temp()
      }
      console.log(tempcounter)
    })
  }
}

function temp () {
  ready = true
}

function processDataForDisplay () {
  console.log(JSON.stringify(calculatedScores))
  for (var i = 0; i < calculatedScores.length; i++) {
    var user = calculatedScores[i]
    var currentData = {}
    currentData['name'] = user['name']
    currentData['profilePic'] = user[username].profilePic
    var rows = []
    for (var x = 0; x < user['data'].length; x++) {
      var imgRow = user['data'][x]
      if (imgRow.error == false) {
        var color = 'yellow'
        if (imgRow.score < 0.2) {
          color = 'red'
        } else if (imgRow.score > 0.5) {
          color = 'green'
        }
        rows.push({
          url: imgRow.url,
          score: imgRow.score,
          color: color
        })
      }
    }
    currentData['rows'] = rows

    displayData.push(currentData)
  }
}

var displayData = []
var ready = false
var usernameG
exports.results = function (req, res) {
  processDataForDisplay()
  console.log(JSON.stringify(displayData))
  res.render('results', { username: usernameG, results: displayData })
}

exports.isReady = function (req, res) {
  res.send(ready)
}

exports.authorize_user = function (req, res) {
  if (access_token) {
    res.redirect('/handleauth')
    return
  }
  newRedirect_uri = redirect_uri + '?username=' + req.query.username
  usernameG = req.query.username
  res.redirect(api.get_authorization_url(newRedirect_uri, {scope: ['public_content']}))
}

exports.handleauth = function (req, res) {
  resGlobal = res
  if (access_token) {
    isLoggedIn(req, res)
    return
  }

  api.authorize_user(req.query.code, newRedirect_uri, function (err, result) {
    if (err) {
      console.log(err.body)
    } else {
      console.log('Yay! Access token is ' + result.access_token)
    }

    api.use({ access_token: result.access_token })
    access_token = result.access_token
    // lib.TheOnlyMohammed.mediaFilter['@dev']({ userID: "elloimraj", token: access_token, firsthalf: true }, (err, result) => {

    //   if (result) {
    //     // for (var k in result) {
    //     //   if (k == 'error') {
    //     //     return
    //     //   }
    //     //   result[k] = Object.values(result[k])
    //     //   name = k
    //     // }
    //     console.log("Got results ")
    //     console.log(result)
    //     calculatedScores.push(result)
    //   }
    // })
    isLoggedIn(req, res)
    res.render('loading')
  })
}

function isLoggedIn (req, res) {
  var username = req.query.username
  // request({
  //   uri: 'https://www.parsehub.com/api/v2/projects/tETfMCbfN8Md/run',
  //   method: 'POST',
  //   form: {
  //     api_key: 'tr0EdoMBubaDWcHYw0C7taFd',
  //     start_url: 'https://www.instagram.com',
  //     start_template: 'main_template',
  //     start_value_override: JSON.stringify({user: username}),
  //     send_email: '0'
  //   }
  // }, function (err, resp, body) {
  //   console.log('running')
  //   console.log(body)
  //   var runID = JSON.parse(body).run_token
  //   setTimeout(checkRun, 20000, runID)
  // })

  getLastRun()
}

exports.index = function (req, res) {
  res.render('index')
}

// This is where you would initially send users to authorize 
app.get('/authorize_user', exports.authorize_user)
// This is your redirect URI 
app.get('/handleauth', exports.handleauth)

app.get('/results', exports.results)

app.get('/isReady', exports.isReady)

app.get('/', exports.index)

http.createServer(app).listen(3000, function () {
  console.log('Express server listening on port ' + 3000)
})

function checkRun (runID) {
  console.log('checking')
  console.log(runID)
  request({
    uri: 'https://www.parsehub.com/api/v2/runs/' + runID,
    method: 'GET',
    qs: {
      api_key: 'tr0EdoMBubaDWcHYw0C7taFd'
    }
  }, function (err, resp, body) {
    console.log(body)
    var body = JSON.parse(body)
    var doneRunning = body.data_ready
    if (doneRunning) {
      runIsDone(runID)
    }else {
      setTimeout(checkRun, 5000, runID)
    }
  })
}

function runIsDone (runID) {
  request({
    uri: 'https://www.parsehub.com/api/v2/runs/' + runID + '/data',
    method: 'GET',
    gzip: true,
    qs: {
      api_key: 'tr0EdoMBubaDWcHYw0C7taFd'
    }
  }, function (err, resp, body) {
    console.log(body)
    parseFollowers(body)
  })
}

function getLastRun () {
  request({
    uri: 'https://www.parsehub.com/api/v2/projects/tETfMCbfN8Md/last_ready_run/data',
    method: 'GET',
    gzip: true,
    qs: {
      api_key: 'tr0EdoMBubaDWcHYw0C7taFd'
    }
  }, function (err, resp, body) {
    console.log(body)
    parseFollowers(body)
  })
}
