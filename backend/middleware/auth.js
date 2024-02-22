const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {    // On récupère le token
       const token = req.headers.authorization.split(' ')[1]; // On sépare "Bearer" du token avec .split, et on récupère le 2eme élément ( le token ) ( [1] )
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // On décode le token avec jwt.verify(). Les arguments sont le token récupéré et la clé secrète
       const userId = decodedToken.userId; // On récupère le userId du token décodé
       req.auth = { // On crée l'objet 'auth' dans l'objet request pour que toutes les routes puissent l'utiliser.
           userId: userId // La valeur du userId est l'userId récupéré dans le token
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};