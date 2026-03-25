# 📚 PDF Cover Generator pour ZimaOS / CasaOS

Une application web légère et conteneurisée sous Docker, conçue spécifiquement pour les NAS (ZimaOS, CasaOS, Ubuntu...). Elle permet d'explorer votre bibliothèque locale de Bandes Dessinées et d'eBooks (fichiers PDF) et d'en extraire la première page pour générer automatiquement une image de couverture au format PNG.

Idéal pour organiser et illustrer vos bibliothèques de médias !

## ✨ Fonctionnalités

* **Explorateur de fichiers intégré :** Naviguez facilement dans vos dossiers directement depuis l'interface web.
* **Extraction intelligente :** Génère une image PNG à partir de la première page du PDF.
* **Respect des proportions :** Préserve parfaitement le format d'origine (Portrait, Paysage, Carré) sans aucune déformation grâce à Ghostscript/GraphicsMagick.
* **Nommage automatique :** L'image générée porte exactement le même nom que le fichier PDF d'origine (ex: `MaSuperBD.pdf` -> `MaSuperBD.png`).
* **Sauvegarde locale :** Les couvertures sont enregistrées directement dans le même dossier que le fichier source.
* **Filtre intelligent :** Les PDF possédant déjà une couverture n'apparaissent plus dans la liste des tâches en attente.

## 🚀 Installation sur ZimaOS / CasaOS

L'application est automatiquement construite et hébergée sur le registre de paquets GitHub (GHCR). L'installation sur votre NAS se fait en moins d'une minute !

1. Ouvrez l'interface de **ZimaOS** ou **CasaOS**.
2. Allez dans l'App Store et cliquez sur **Custom Install** (Installation personnalisée) ou l'icône **"+"**.
3. Remplissez les champs de la façon suivante :

* **Image :** `ghcr.io/dnau1973-hash/pdf-cover-generator:latest` *(remplacez `ton_pseudo` par votre nom d'utilisateur GitHub)*
* **Title :** PDF Cover Generator
* **Icon :** `https://cdn-icons-png.flaticon.com/512/337/337946.png` *(ou l'URL de votre choix)*
* **Web UI :** `3001`
* **Port :** * Host: `3001`
  * Container: `3001`
* **Volumes :** C'est ici que vous connectez vos médias.
  * Host: `/CHEMIN/VERS/VOS/MEDIAS` *(ex: /DATA/AppData/Media)*
  * Container: `/usr/src/app/Media`
  * **Important :** Laissez le volume en mode "Lecture/Écriture" (Read/Write) pour que l'application puisse sauvegarder les images PNG à côté de vos PDF.

4. Cliquez sur **Install**. L'application apparaîtra sur votre tableau de bord !

## 💻 Installation classique (Docker Compose)

Si vous utilisez un serveur Linux classique (Ubuntu, Debian...), voici le fichier `docker-compose.yml` à utiliser :

```yaml
services:
  pdf-cover-generator:
    image: ghcr.io/ton_pseudo/pdf-cover-generator:latest
    container_name: pdf-cover-generator
    ports:
      - "3001:3001"
    volumes:
      - /chemin/vers/vos/medias:/usr/src/app/Media
    restart: unless-stopped