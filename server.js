// --- API : Génération de l'image ---
app.post('/api/generate', async (req, res) => {
    const { filePath } = req.body;
    
    if (!filePath) return res.status(400).json({ error: "Aucun fichier sélectionné." });

    const fullPath = path.join(mediaDir, filePath);

    if (!fullPath.startsWith(mediaDir) || !fs.existsSync(fullPath)) {
        return res.status(403).json({ error: "Fichier invalide ou accès refusé." });
    }

    // On récupère le nom exact du fichier PDF (sans l'extension .pdf)
    const exactBaseName = path.basename(fullPath, '.pdf');

    const options = {
        density: 150,
        saveFilename: exactBaseName, // Utilise le nom d'origine
        savePath: "./covers",
        format: "png",
        width: 800
    };

    try {
        const storeAsImage = fromPath(fullPath, options);
        // pdf2pic va générer un fichier du type "exactBaseName_1.png"
        const resolve = await storeAsImage(1); 
        
        // --- NOUVEAU : On renomme le fichier pour enlever le "_1" ---
        const originalOutputPath = path.join(coverDir, resolve.name);
        const finalOutputName = `${exactBaseName}.png`;
        const finalOutputPath = path.join(coverDir, finalOutputName);

        // Si le fichier temporaire de pdf2pic existe bien, on le renomme
        if (fs.existsSync(originalOutputPath)) {
            // Attention : s'il y a déjà une ancienne couverture avec ce nom, elle sera écrasée
            fs.renameSync(originalOutputPath, finalOutputPath);
        }

        // On renvoie l'URL avec le nom de fichier propre
        res.json({ success: true, coverUrl: `/covers/${finalOutputName}` });

    } catch (error) {
        console.error("Erreur de conversion:", error);
        res.status(500).json({ error: "Erreur lors de la génération de la couverture." });
    }
});