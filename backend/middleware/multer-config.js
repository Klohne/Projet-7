const multer = require("multer");

const storage = multer.memoryStorage(); // Stockage dans la mémoire tampon

module.exports = multer({ storage }).single("image");