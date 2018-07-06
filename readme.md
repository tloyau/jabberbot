# JabberBot
## Documentation

### Qu'est-ce que c'est ?
Le JabberBot est un bot qui a été développé pour la plateforme Cisco Jabber afin de montrer un exemple d'utilisation de ces derniers sur cette plateforme. Le bot communique avec l'API Netatmo afin de récupérer les données récupérées par la sonde installée dans le Showroom Collaboration.

### Comment l'utiliser ?
Le JabberBot est installé dans l'organisation *Cisco France Demo Org*. Vous devez par conséquent vous rendre dans le Showroom Collaboration afin de l'utiliser depuis les postes de Pierre ou Simon.  (**Le JabberBot n'est pleinement utilisable que sur une machine Windows**)

### Comment l'installer ?
Si vous souhaitez cloner ce projet afin d'installer le JabberBot dans votre organisation, suivez ces étapes :
```
git clone https://github.com/tloyau/jabberbot

npm install
```
Maintenant créer un fichier `.env` :
```
touch .env
```
Et remplissez-le en suivant l'example du fichier `env_example` :
```
jid=
password=
host=
jabberPORT=
PORT=
netatmoUsername=
netatmoPassword=
netatmoClientId=
netatmoClientSecret=
netatmoScope=
netatmoDeviceId=
urlChart=YOUR_URL/charts/
```

### Comment l'exécuter et commencer à lui parler ?
Exécuter cette commande afin de lancer le bot :
```
node bot.js
```
Vous pouvez maintenant lui parler sur Cisco Jabber en lui disant :
```
help
```

### Plus d'infos
Si vous souhaitez avoir plus d'informations sur le Cisco Jabber Bot SDK, suivez ce lien https://developer.cisco.com/docs/jabber-bots/#!cisco-jabber-bot-sdk-developer-guide
