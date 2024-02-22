const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // On hash le mdp ( req.body.password). le nombre en 2eme argument correspond aux tours effectués par l'algo ( + de tours = + de sécurité & plus long à traiter)
    .then(hash => { // on récupère le hash et on l'enregistre dans un nouvel utilisateur
        const user = new User({ // On crée un nouveau User
            email: req.body.email, // Email transmi à la BDD
            password: hash  // mdp crypté transmi à la BDD
        });
        user.save() // On enregistre l'user dans la BDD
        .then(() => res.status(201).json({message: 'Utilisateur créé'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error })); // Code 500 = Erreur serveur
};

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email}) // On cherche dans la BDD l'utilisateur dont le mail correspond à l'email rentré lors du login
    .then(user => { 
        if (user === null){// S'il n'est pas trouvé, on indique que les logs sont incorrects, pour ne pas dire que les identifiants n'existent pas ( cela constitue une fuite de données)
            res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'}) // Code 401 = Demande au serveur non authentifiée
        } else { // S'il est trouvé, on compare le hash du mdp enregistré avec le hash du mdp rentré lors du login
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) { // Erreur en cas de mdp incorrect
                    res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'})
                } else{ // Si mdp correct, on crée un objet avec les infos nécessaires aux actions qu'on effectuera une fois connecté.
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign( // Fonction sign() de jsonwebtoken
                            { userId : user._id }, // Payload ( données que l'on veut encoder dans le token). On vérifie le user._id pour être sûr que la requête correspond au bon id
                                                    // On vérifie le user._id pour qu'un utilisateur ne puisse modifier que ses propres objets, et pas ceux des autres.
                            'RANDOM_TOKEN_SECRET', // Clé secrète de pour l'encodage ( normalement plus longue et aléatoire )
                            { expiresIn: '24h' } // Le token expirera au bout de 24h
                        )
                    });
                }
            })
            .catch(error => res.status(500).json({ error }))
        }
    })
    .catch(error => res.status(500).json({ error }))
};