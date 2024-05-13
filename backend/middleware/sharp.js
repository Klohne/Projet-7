const sharp = require("sharp");
const path = require("path");

module.exports = (req, res, next) => {
  if (!req.file) { // On vérifie si la requête comporte un fichier ou non
    return next();
  }

  const newFileName = `${req.file.originalname.split(" ").join("_").split(".")[0]}_${Date.now()}.webp`; // On attribue un nouveau nom au fichier en supprimant les espaces et en ajoutant un timestamp.

  const outputPath = path.join(__dirname, "..", "images", newFileName); // On défini le chemin du nouveau fichier en entrant dans 'images' et on attribue le newFileName

  sharp(req.file.buffer) // On va chercher le fichier dans la mémoire tampon
    .resize({ height: 600 }) // Nouvelle hauteur
    .webp({ quality: 90 }) // Conversion en webp + qualité post conversion
    .toFile(outputPath, (error) => { // Sauvegarde de l'image
      if (error) {
        return res.status(500).json({ error });
      }
      req.file.filename = newFileName; // Mise à jour du nom du fichier
      req.file.path = outputPath; // Mise à jour du chemin d'accès du fichier
      next();
    });
};