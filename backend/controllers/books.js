const Book = require('../models/Book');
const fs = require('fs');

exports.addBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
};

// Modification de l'objet // On gère ici deux cas : Si l'utilisateur a transmis un fichier ou non lors de la modification
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? { // On regarde s'il y a un champ 'file' dans l'objet requête
        ...JSON.parse(req.body.book), // Si oui, on parse la chaine de caractères dans un json et on crée une URL au fichier image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }; // Si pas de 'file' on récupère directement l'objet dans le corps de la requête

    delete bookObject._userId;
    Book.findOne({_id: req.params.id}) // On récupère l'objet dans la BDD pour vérifier que l'utilisateur qui cherche à le modifier soit bien celui qui l'a créé
        .then((book) => {
            if (book.userId != req.auth.userId) { // Si le userId de la BDD est différent de celui qui vient du token, ça veut dire que qqun tente de modifier un objet qui ne lui appartient pas
                res.status(401).json({message: "Non-autorisé" });
            } else { //  ({enregistrement à mettre à jour}, {avec quel objet}
                Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message: "Objet modifié"}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
};

//Suppression d'un objet 
exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id}) // On récupère l'objet dans la BDD
    .then(book => {
        if (book.userId != req.auth.userId){ // On vérifie que le userId enregistré en BDD correspond à celui qui vient du token
            res.status(401).json({message: "Non-autorisé"});
        } else {
            const filename = book.imageUrl.split('/images/')[1]; // On récupère le nom du fichier grâce à l'URL de l'image. On fait un split pour récupérer l'élément qui suit '/images/' ( [1] )
            fs.unlink(`images/${filename}`, () => { 
                Book.deleteOne({_id: req.params.id}) // On cible l'Id pour sélectionner le livre à supprimer
                .then(() => {res.status(200).json({message: 'Livre supprimé'})})
                .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    })
};

// Ceci est la requête GET qui va afficher les objets en fonction de l'ID récupérée (:id), elle les sélectionne donc de façon individuelle
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id }) // Ici, on va chercher (.findOne) le Book ayant le même id (_id) que celui présent dans l'URL / le paramètre de requête (req.params.id)
        .then(book => res.status(200).json(book)) // On renvoie ce Book au frontend
        .catch(error => res.status(404).json({ error })); // Code 404 = page non trouvée / Book non trouvé
};

// Ceci est la requête GET générale, qui permet de récupérer TOUS les objets de la BDD. On ne peut pas récupérer les objets individuellement avec cette requête.
exports.getAllBooks = (req, res, next) => {
    Book.find() // On récupère le tableau de tous les 'books' contenus dans Book
    .then(books => res.status(200).json(books)) // On les renvoie en réponse 200 ( Code 200 = requête client faite avec succès)
    .catch(error => res.status(400).json({ error }));
  };

    /*     Les méthodes de votre modèle Book permettent d'interagir avec la base de données :
        save()  – enregistre un Book ;
        find()  – retourne tous les Books ;
        findOne()  – retourne un seul Book basé sur la fonction de comparaison qu'on lui passe (souvent pour récupérer un Book par son identifiant unique).
    La méthode  router.get()  permet de réagir uniquement aux requêtes de type GET. */