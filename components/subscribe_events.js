var debug = require('debug')('botkit:subscribe_events')

module.exports = function (controller) {
  debug('Subscribing to Cisco webhook events...')

  var webhookName = controller.config.webhook_name || 'Botkit Firehose'

  controller.api.webhooks.list().then(function (list) {
    var hookId = null

    for (var i = 0; i < list.items.length; i++) {
      if (list.items[i].name === webhookName) {
        hookId = list.items[i].id
      }
    }

    var hookUrl = 'https://' + controller.config.public_address + '/ciscospark/receive'

    debug('Cisco Spark: incoming webhook url is ', hookUrl)

    if (hookId) {
      controller.api.webhooks.update({
        id: hookId,
        resource: 'all',
        targetUrl: hookUrl,
        event: 'all',
        secret: controller.config.secret,
        name: webhookName
      }).then(function (res) {
        debug('Cisco Spark: SUCCESSFULLY UPDATED CISCO SPARK WEBHOOKS')
      }).catch(function (err) {
        debug('FAILED TO REGISTER WEBHOOK', err)
        throw new Error(err)
      })
    } else {
      controller.api.webhooks.create({
        resource: 'all',
        targetUrl: hookUrl,
        event: 'all',
        secret: controller.config.secret,
        name: webhookName
      }).then(function (res) {
        debug('Cisco Spark: SUCCESSFULLY REGISTERED CISCO SPARK WEBHOOKS')
      }).catch(function (err) {
        debug('FAILED TO REGISTER WEBHOOK', err)
        throw new Error(err)
      })
    }
  })
}
