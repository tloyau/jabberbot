module.exports = function (controller) {
  controller.hears(['hello'], 'direct_message,direct_mention', function (bot, message) {
    bot.reply(message, 'Hello, je suis le tout premier bot Jabber du Showroom !')
  })
}
