# On part d'une image Node.js ultra-légère
FROM node:18-alpine

# Installation des outils système obligatoires pour traiter les PDF et les images
RUN apk add --no-cache graphicsmagick ghostscript

# On définit le dossier de travail à l'intérieur du conteneur
WORKDIR /usr/src/app
# On copie d'abord les fichiers package.json (pour optimiser le cache de Docker)
COPY package*.json ./

# On installe les dépendances Node.js (express, pdf2pic...)
RUN npm install

# On copie tout le reste du projet (server.js, dossier public...)
COPY . .

# On indique que l'application communique sur le port 3000
EXPOSE 3001

# La commande qui sera lancée au démarrage du conteneur
CMD [ "node", "server.js" ]