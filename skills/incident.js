module.exports = function (controller) {
  controller.hears(['^incident$'], 'direct_message,direct_mention', function (bot, message) {
    let replyMessage = {}
    let to = message.user
    let type = message.group ? 'groupchat' : 'chat'
    let body = 'Showroom Status'
    replyMessage.text = body
    replyMessage.stanza = `<message to="${to}" type="${type}"><body>${body}</body> <html xmlns="http://jabber.org/protocol/xhtml-im"> <body xmlns="http://www.w3.org/1999/xhtml"> <div style="width: 30vw"> <h3 style="padding: 1vw">Vous souhaitez contacter un administrateur afin de déclarer un incident ?</h3> <h4 style="padding: 1vw">Merci de remplir les champs suivants afin que celui-ci puisse vous recontacter.</h4> <form onsubmit="return false;"> <div class="form-group" style="padding: 1vw"> <label for="nom" style="">Nom</label> <input type="email" class="form-control" id="nom" name="nom" placeholder="Entrez votre nom"/> </div><div class="form-group" style="padding: 1vw"> <label for="prenom" style="">Prénom</label> <input type="email" class="form-control" id="prenom" name="prenom" placeholder="Entrez votre prénom"/> </div><div class="form-group" style="padding: 1vw"> <label for="mail" style="">Adresse mail</label> <input type="email" class="form-control" id="mail" name="mail" placeholder="Entrez votre email"/> </div><div class="form-group" style="padding: 1vw"> <label for="mail" style="">Priorité de l'incident</label> <select name="priority" class="form-control"> <option value="normal">Normale</option> <option value="important">Importante</option> <option value="vimportant">Très importante</option> </select> </div><div class="form-group" style="padding: 1vw"> <label for="incident" style="">Description de l'incident</label> <textarea class="form-control" rows="5" name="incident" placeholder="Décrivez en quelques lignes"></textarea> </div><div class="form-group" style="padding: 1vw"> <button robot-type="robot-submit" type="button" class="btn btn-primary form-control">Envoyer</button> </div></form> </div></body> </html> </message>`

    bot.startConversation(message, function (err, convo) {
      if (!err) {
        convo.ask(replyMessage, function (response, convo) {
          try {
            if (response.from_jid === bot.client_jid) {
              return
            }
            let query = JSON.parse(response.text)

            if (query.incident === '') {
              bot.reply(message, 'Vous n\'avez rien déclaré')
              convo.stop()
            } else {
              bot.reply(message, 'Votre délacration est la suivante : ' + query.incident + '. \n\nElle sera traitée très prochainement par l\'administrateur.')
              convo.stop()
            }
          } catch (err) {
            console.log(err.message)
            convo.stop()
          }
        })
      }
    })
  })
}
