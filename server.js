const express = require('express');
const { fromPath } = require('pdf2pic');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

app.use(express.json());

const mediaDir = path.join(__dirname, 'Media');

if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

app.use(express.static('public'));
// NOUVEAU : On permet au navigateur d'accéder aux images directement dans le dossier Media
app.use('/Media', express.static(mediaDir));

// --- API : Explorateur de fichiers ---
app.get('/api/explore', (req, res) => {
    const queryPath = req.query.path || '';
    const targetPath = path.join(mediaDir, queryPath);

    if (!targetPath.startsWith(mediaDir)) return res.status(403).json({ error: "Accès refusé." });
    if (!fs.existsSync(targetPath)) return res.status(404).json({ error: "Dossier introuvable." });

    try {
        const items = fs.readdirSync(targetPath, { withFileTypes: true });
        const result = [];

        for (const item of items) {
            if (item.isDirectory()) {
                result.push({
                    name: item.name,
                    isDirectory: true,
                    path: path.join(queryPath, item.name).replace(/\\/g, '/')
                });
            } else if (item.name.toLowerCase().endsWith('.pdf')) {
                // NOUVEAU : On vérifie si la couverture existe déjà dans le même dossier
                const exactBaseName = path.basename(item.name, path.extname(item.name));
                const coverPath = path.join(targetPath, exactBaseName + '.png');
                
                // Si le fichier .png N'EXISTE PAS, on ajoute le PDF à la liste
                if (!fs.existsSync(coverPath)) {
                    result.push({
                        name: item.name,
                        isDirectory: false,
                        path: path.join(queryPath, item.name).replace(/\\/g, '/')
                    });
                }
            }
        }

        // Tri : dossiers en premier
        result.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
        });

        res.json({ currentPath: queryPath, items: result });
    } catch (error) {
        res.status(500).json({ error: "Erreur de lecture du répertoire." });
    }
});

// --- API : Génération de la couverture ---
app.post('/api/generate', async (req, res) => {
    const { filePath } = req.body;
    
    if (!filePath) return res.status(400).json({ error: "Aucun fichier sélectionné." });

    const fullPath = path.join(mediaDir, filePath);

    if (!fullPath.startsWith(mediaDir) || !fs.existsSync(fullPath)) {
        return res.status(403).json({ error: "Fichier invalide ou accès refusé." });
    }

    // NOUVEAU : On récupère le dossier exact où se trouve le PDF
    const fileDir = path.dirname(fullPath);
    const exactBaseName = path.basename(fullPath, '.pdf');

    const options = {
        density: 150,
        saveFilename: exactBaseName,
        savePath: fileDir, // NOUVEAU : Sauvegarde à côté du PDF !
        format: "png",
        width: 1200,
        height: 1600,
        preserveAspectRatio: true
    };

    try {
        const storeAsImage = fromPath(fullPath, options);
        const resolve = await storeAsImage(1); 
        
        const originalOutputPath = path.join(fileDir, resolve.name);
        const finalOutputName = `${exactBaseName}.png`;
        const finalOutputPath = path.join(fileDir, finalOutputName);

        if (fs.existsSync(originalOutputPath)) {
            fs.renameSync(originalOutputPath, finalOutputPath);
        }

        // Calculer l'URL publique pour le navigateur
        const relativeDir = path.dirname(filePath).replace(/\\/g, '/');
        const coverUrl = relativeDir === '.' 
            ? `/Media/${finalOutputName}` 
            : `/Media/${relativeDir}/${finalOutputName}`;

        res.json({ success: true, coverUrl });

    } catch (error) {
        console.error("Erreur de conversion :", error);
        res.status(500).json({ error: "Erreur lors de la génération de la couverture." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});