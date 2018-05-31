module.exports = function (controller) {
  controller.hears(['help'], 'direct_message,direct_mention', function (bot, message) {
    bot.reply(message, 'Je suis le JabberBot et je peux t\'envoyer, si tu le souhaites, ' +
    'des infos sur les conditions météo du Showroom.\n\n' +
    'Pour cela, envoie la commande suivante : status\n\n' +
    'Tu peux également déclarer un incident et alerter l\'administrateur grâce à la commande : incident')
  })
}
