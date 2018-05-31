var path = require('path')

var env = require('node-env-file')
env(path.join(__dirname, '/.env'))

var Botkit = require('botkit')
require('debug')('botkit:main')

var controller = Botkit.jabberbot({
  json_file_store: './store/'
})

controller.spawn({
  client: {
    jid: process.env.jid,
    password: process.env.password,
    host: process.env.host,
    port: process.env.jabberPORT
  }
})

// Set up an Express-powered webserver to expose oauth and webhook endpoints
require(path.join(__dirname, '/components/express_webserver.js'))(controller)

var normalizedPath = require('path').join(__dirname, 'skills')
require('fs').readdirSync(normalizedPath).forEach(function (file) {
  require('./skills/' + file)(controller)
})
