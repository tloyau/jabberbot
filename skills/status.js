var querystring = require('querystring')
var https = require('https')

module.exports = function (controller) {
  controller.hears(['^status$', '^status (.*)$'], 'direct_message,direct_mention', function (bot, message) {
    var param = message.match[1]
    var paramsAccepted = ['co2', 'noise', 'temperature', 'humidity', 'pressure']

    if (paramsAccepted.includes(param)) {
      retrieveNetatmoToken(function (token) {
        retrieveNetatmoCurrentData(token, function (data) {
          var values = data.devices[0].dashboard_data
          var value = ''
          var color = ''
          var unit = ''

          for (var item in values) {
            var name = item

            if (name.toLowerCase() === param) {
              value = values[item]
            }
          }

          switch (param) {
            case 'co2': {
              color = '#f0ad4e'
              param = 'CO2'
              unit = 'ppm'
              break
            }
            case 'temperature':
              color = '#d9534f'
              param = 'Température'
              unit = '°C'
              break
            case 'noise':
              color = '#5cb85c'
              param = 'Nuisance sonore'
              unit = 'dB'
              break
            case 'humidity':
              color = '#428bca'
              param = 'Humidité'
              unit = '%'
              break
            case 'pressure':
              color = '#5bc0de'
              param = 'Pression'
              unit = 'Pa'
              break
            default:
              color = '#eee'
          }

          sendMessage(value, param, color, unit, bot, message)
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

function sendMessage (value, param, color, unit, bot, message) {
  let replyMessage = {}
  let to = message.user
  let type = message.group ? 'groupchat' : 'chat'
  let body = 'Showroom Status'
  replyMessage.text = body
  replyMessage.stanza = `<message to="${to}" type="${type}"> <body>${body}</body> <html xmlns="http://jabber.org/protocol/xhtml-im"> <body xmlns="http://www.w3.org/1999/xhtml"> <div style="padding: 1vw; text-align: center"> <div style="padding: 1vw; background-color: white; border-radius: 0.5vw"> <h4 style="margin-right: 1vw; display: inline">${param}</h4> <b style="font-size: 16px; padding: 0.5vw; background-color: ${color}; color: white; border-radius: 0.5vw"> ${value} ${unit}</b> </div></div></body> </html> </message>`
  bot.reply(message, replyMessage)
}

function sendFirstMessage (bot, message) {
  let replyMessage = {}
  let to = message.user
  let type = message.group ? 'groupchat' : 'chat'
  let body = 'Showroom Status'
  replyMessage.text = body
  replyMessage.stanza = `<message to="${to}" type="${type}"> <body>${body}</body> <html xmlns="http://jabber.org/protocol/xhtml-im"> <body xmlns="http://www.w3.org/1999/xhtml"> <div style="padding: 1vw; text-align: center"> <h4 style="margin-top: 0vw; margin-bottom: 1.5vw">Choisis une donnée et je t'enverrai sa valeur en temps réel</h4> <button robot-type="robot-button" type="button" robot-message="status co2" class="btn btn-warning" style="background-color: white; margin-right: 1vw"> CO2 </button> <button robot-type="robot-button" type="button" robot-message="status temperature" class="btn btn-danger" style="background-color: white; margin-right: 1vw"> Température </button> <button robot-type="robot-button" type="button" robot-message="status humidity" class="btn btn-primary" style="background-color: white; margin-right: 1vw"> Humidité </button> <button robot-type="robot-button" type="button" robot-message="status pressure" class="btn btn-info" style="background-color: white; margin-right: 1vw"> Pression </button> <button robot-type="robot-button" type="button" robot-message="status noise" class="btn btn-success" style="background-color: white; margin-right: 1vw"> Nuisance sonore </button> <br /><br /> <h5>Je peux également t'envoyer un graphique pour chaque donnée</h5> <button robot-type="robot-button" type="button" robot-message="graph" class="btn btn-default" style="background-color: white; margin-right: 1vw"> Graphiques </button> </div> <h6 class="text-center">Déclare un incident si tu as remarqué quelque chose d'anormal</h6><button class="btn btn-default center-block" robot-type="robot-button" type="button" robot-message="incident">Déclarer un incident</button> </body> </html></message>`
  bot.reply(message, replyMessage)
}
