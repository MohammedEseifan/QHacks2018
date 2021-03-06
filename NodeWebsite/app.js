// import { timeout, times } from '../../../../../AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/async'
// import { json } from '../../../../../AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/body-parser'

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

var redirect_uri = 'http://ec2-13-59-101-147.us-east-2.compute.amazonaws.com:3000/handleauth'
var newRedirect_uri
var access_token = null
var userBuffer = {}

function parseFollowers (data) {
  var jsonData = JSON.parse(data).following;
  var tempcounter = jsonData.length;
  for (var i = 0; i < jsonData.length; i++) {
    var name = jsonData[i].name;
    userBuffer[name] = null;
    console.log('Sending request for ' + name);
    lib.spazoide.WatchfulAI['@dev']({ userID: name, token: access_token, firsthalf: true }, (err, result) => {
      tempcounter = tempcounter - 0.5
      console.log('Got Result1 From: ' + JSON.stringify(result))
      console.log('Got Result1 From: ' + JSON.stringify(err))
      if (result == null) {
      }
      if (result && !result.error && result.name) {
        // console.log(JSON.stringify(result))

        if (userBuffer[result.name] == null) {
          console.log('FIRST')
          userBuffer[result.name] = result
        } else {
          console.log('GFGDFDFGDFG')
          userBuffer[result.name].data = userBuffer[result.name].data.concat(result.data)
        }
      }
      if (tempcounter == 0) {
        temp()
      }
      console.log(tempcounter)
    })
    lib.spazoide.WatchfulAI['@dev']({ userID: name, token: access_token, firsthalf: false }, (err, result) => {
      tempcounter = tempcounter - 0.5
      console.log('Got Result2 From: ' + JSON.stringify(result))
      console.log('Got Result2 From: ' + JSON.stringify(err))
      if (result == null) {
        // console.log('Got Result2 From: ' + JSON.stringify(err))
      }
      if (result && !result.error && result.name) {
        // console.log(JSON.stringify(result))

        if (userBuffer[result.name] == null) {
          console.log('SECOND')
          userBuffer[result.name] = result
        } else {
          console.log('GFGDFDFGDFG2')
          userBuffer[result.name].data = userBuffer[result.name].data.concat(result.data)
        }
      }

      if (tempcounter == 0) {
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
  displayDay = []
  var calculatedScores = Object.values(userBuffer)
  console.log(JSON.stringify(calculatedScores))
  for (var i = 0; i < calculatedScores.length; i++) {
    var user = calculatedScores[i]
    if (user == null) {
      continue
    }
    var currentData = {}
    currentData['name'] = user.name
    currentData['profilePic'] = user.profilePic
    var rows = []
    var avg = 0
    var oneRed = false
    for (var x = 0; x < user['data'].length; x++) {
      var imgRow = user['data'][x]
      if (imgRow.error == false) {
        avg += imgRow.score
        var color = 'yellow'
        if (imgRow.score < 0.2) {
          color = 'red'
          oneRed = true
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
    avg = avg / user['data'].length
    currentData['averageScore'] = avg
    var r = 255 * (1 - avg)
    var g = 255 * avg
    currentData['backcolor'] = 'rgba(' + Math.round(r).toString() + ',' + Math.round(g).toString() + ',0,0.75)'
    rows.sort(function (a, b) {return a.score - b.score})
    currentData['rows'] = rows

    currentData['border'] = oneRed ? 'red' : 'none'
    displayData.push(currentData)
  }
}

var displayData = []
var ready = false
var usernameG

exports.results = function (req, res) {
  processDataForDisplay()
  console.log(JSON.stringify(displayData))
  res.render('results', { username: usernameG, results: displayData, pic: user_profilepic })
}

exports.isReady = function (req, res) {
  res.send(ready)
}

exports.authorize_user = function (req, res) {
  usernameG = req.query.username
  ready=false;
  if (access_token) {
    res.redirect('/handleauth')
    return
  }
  newRedirect_uri = redirect_uri + '?username=' + req.query.username

  res.redirect(api.get_authorization_url(newRedirect_uri, {scope: ['public_content']}))
}

var user_profilepic

exports.handleauth = function (req, res) {
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

    // lib.spazoide.WatchfulAI['@dev']({ userID: "elloimraj", token: access_token, firsthalf: true }, (err, result) => {
    api.user_search(usernameG, function (err, users, remaining, limit) {
      if (err) {
        console.log(err.body)
      }
      user_profilepic = users[0].profile_picture
    })
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
  })
}

function isLoggedIn (req, res) {
  // request({
  //   uri: 'https://www.parsehub.com/api/v2/projects/tETfMCbfN8Md/run',
  //   method: 'POST',
  //   form: {
  //     api_key: 'tr0EdoMBubaDWcHYw0C7taFd',
  //     start_url: 'https://www.instagram.com',
  //     start_template: 'main_template',
  //     start_value_override: JSON.stringify({user: usernameG}),
  //     send_email: '0'
  //   }
  // }, function (err, resp, body) {
  //   console.log('running')
  //   console.log(body)
  //   var runID = JSON.parse(body).run_token
  //   setTimeout(checkRun, 20000, runID)
  // })

  getLastRun()
  res.render('loading')
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
