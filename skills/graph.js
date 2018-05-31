var querystring = require('querystring')
var fs = require('fs')
var https = require('https')
var moment = require('moment')
var plotly = require('plotly')('tloyau', '2XiZ2gzFsXXbAPSYTQkG')

var indexChart = {
  'co2': 0,
  'noise': 0,
  'temperature': 0,
  'humidity': 0,
  'pressure': 0
}

module.exports = function (controller) {
  controller.hears(['^graph$', '^graph (.*)$'], 'direct_message,direct_mention', function (bot, message) {
    var param = message.match[1]
    var paramsAccepted = ['co2', 'noise', 'temperature', 'humidity', 'pressure']

    if (paramsAccepted.includes(param)) {
      retrieveNetatmoToken(function (token) {
        retrieveNetatmoCurrentData(token, function (data) {
          var values = data.devices[0].dashboard_data
          var value = ''

          for (var item in values) {
            var name = item

            if (name.toLowerCase() === param) {
              value = values[item]
            }
          }

          retrieveNetatmoAllData(token, param, function (dataAllDay) {
            createGraph(dataAllDay, param, function (url) {
              sendMessage(value, param, url, bot, message)
            })
          })
        })
      })
    } else {
      sendFirstMessage(bot, message)
    }
  })
}

function retrieveNetatmoToken (cb) {
  var options = {
    hostname: 'api.netatmo.com',
    path: '/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  var params = querystring.stringify({
    'grant_type': 'password',
    'username': process.env.netatmoUsername,
    'password': process.env.netatmoPassword,
    'client_id': process.env.netatmoClientId,
    'client_secret': process.env.netatmoClientSecret,
    'scope': process.env.netatmoScope
  })

  var callback = function (response) {
    response.on('error', function (e) {
      console.log('error', e)
    })
    var res = ''

    response.on('data', function (chunk) {
      res += chunk
    })

    response.on('end', function () {
      res = JSON.parse(res)
      if (response.statusCode === 200) {
        cb(res.access_token)
      } else {
        console.log('status code:', response.statusCode, '\n', res)
      }
    })
  }

  var req = https.request(options, callback)
  req.on('error', function (e) {
    console.log('There is a problem with your request:', e.message)
  })

  req.write(params)
  req.end()
}

function retrieveNetatmoCurrentData (token, cb) {
  var params = querystring.stringify({
    'access_token': token
  })

  var options = {
    hostname: 'api.netatmo.com',
    path: '/api/getstationsdata',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  var callback = function (response) {
    response.on('error', function (e) {
      console.log('error', e)
    })
    var res = ''

    response.on('data', function (chunk) {
      res += chunk
    })

    response.on('end', function () {
      res = JSON.parse(res)
      if (response.statusCode === 200) {
        var data = res.body
        cb(data)
      } else {
        console.log('status code:', response.statusCode, '\n', res)
      }
    })
  }

  var req = https.request(options, callback)
  req.on('error', function (e) {
    console.log('There is a problem with your request:', e.message)
  })

  req.write(params)
  req.end()
}

function retrieveNetatmoAllData (token, param, cb) {
  var params = querystring.stringify({
    'access_token': token,
    'device_id': process.env.netatmoDeviceId,
    'scale': 'max',
    'type': param,
    'real_time': true,
    'date_begin': moment().startOf('day').unix(),
    'date_end': moment().endOf('day').unix()
  })

  var options = {
    hostname: 'api.netatmo.com',
    path: '/api/getmeasure',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  var callback = function (response) {
    response.on('error', function (e) {
      console.log('error', e)
    })
    var res = ''

    response.on('data', function (chunk) {
      res += chunk
    })

    response.on('end', function () {
      res = JSON.parse(res)
      if (response.statusCode === 200) {
        var data = res.body
        cb(data)
      } else {
        console.log('status code:', response.statusCode, '\n', res)
      }
    })
  }

  var req = https.request(options, callback)
  req.on('error', function (e) {
    console.log('There is a problem with your request:', e.message)
  })

  req.write(params)
  req.end()
}

function createGraph (data, param, cb) {
  var xValues = []
  var yValues = []

  for (var item in data) {
    var details = data[item]
    xValues.push(moment(details.beg_time, 'X').format())
    yValues.push(details.value[0][0])
  }

  var trace = {
    x: xValues,
    y: yValues,
    type: 'scatter'
  }

  var figure = { 'data': [trace] }
  var imgOpts = {
    format: 'png',
    width: 1000,
    height: 500
  }

  plotly.getImage(figure, imgOpts, function (error, imageStream) {
    if (error) return console.log(error)

    if (indexChart[param] > 0) {
      fs.unlink('public/charts/' + param + '_' + (indexChart[param] - 1) + '.png', function () {})
    }

    var url = process.env.urlChart + param + '_' + indexChart[param] + '.png'

    var fileStream = fs.createWriteStream('public/charts/' + param + '_' + indexChart[param] + '.png')

    ++indexChart[param]

    imageStream.pipe(fileStream)
    imageStream.on('end', () => {
      cb(url)
    })
  })
}

function sendMessage (value, param, url, bot, message) {
  let replyMessage = {}
  let to = message.user
  let type = message.group ? 'groupchat' : 'chat'
  let body = 'Showroom Status'
  replyMessage.text = body
  replyMessage.stanza = `<message to="${to}" type="${type}"> <body>${body}</body> <html xmlns="http://jabber.org/protocol/xhtml-im"> <body xmlns="http://www.w3.org/1999/xhtml"> <div style="padding: 1vw; text-align: center"> <div style="padding: 1vw; background-color: white; border-radius: 0.5vw"> <img src="${url}" width="800" class="img-responsive img-rounded" /> </div></div></body> </html> </message>`
  bot.reply(message, replyMessage)
}

function sendFirstMessage (bot, message) {
  let replyMessage = {}
  let to = message.user
  let type = message.group ? 'groupchat' : 'chat'
  let body = 'Showroom Status'
  replyMessage.text = body
  replyMessage.stanza = `<message to="${to}" type="${type}"> <body>${body}</body> <html xmlns="http://jabber.org/protocol/xhtml-im"> <body xmlns="http://www.w3.org/1999/xhtml"> <div style="padding: 1vw; text-align: center"> <h4 style="margin-top: 0vw; margin-bottom: 1.5vw">Choisis une donnée et je t'enverrai son graphique sur la journée</h4> <button robot-type="robot-button" type="button" robot-message="graph co2" class="btn btn-warning" style="background-color: white; margin-right: 1vw"> CO2 </button> <button robot-type="robot-button" type="button" robot-message="graph temperature" class="btn btn-danger" style="background-color: white; margin-right: 1vw"> Température </button> <button robot-type="robot-button" type="button" robot-message="graph humidity" class="btn btn-primary" style="background-color: white; margin-right: 1vw"> Humidité </button> <button robot-type="robot-button" type="button" robot-message="graph pressure" class="btn btn-info" style="background-color: white; margin-right: 1vw"> Pression </button> <button robot-type="robot-button" type="button" robot-message="graph noise" class="btn btn-success" style="background-color: white; margin-right: 1vw"> Nuisance sonore </button> <br /> <br /> <h6 class="text-center">Déclare un incident si tu as remarqué quelque chose d'anormal</h6><button class="btn btn-default center-block" robot-type="robot-button" type="button" robot-message="incident">Déclarer un incident</button> </div></body> </html></message>`
  bot.reply(message, replyMessage)
}
