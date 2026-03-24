FROM node:18-alpine

# Installation des dépendances système nécessaires pour lire/convertir les PDF
RUN apk add --no-cache graphicsmagick ghostscript

# Création du répertoire de l'application
WORKDIR /usr/src/app

# Copie des fichiers de configuration NPM
COPY package*.json ./

# Installation des dépendances Node.js
RUN npm install

# Copie du reste du code
COPY . .

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD [ "npm", "start" ]