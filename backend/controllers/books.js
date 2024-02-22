const Book = require('../models/Book')

exports.addBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.thing);
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

// Modification de l'objet
exports.modifyBook = (req, res, next) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id}) // Le 1er argument de updateOne est l'objet de comparaison (celui qu'on va modifier)
                                                                                // Le 2ème argument est le nouvel objet. On récupère le Book dans le corps de la requête avec
                                                                                // '...req.body', et on précise que l'id correspond à celui des paramètres.
    .then(() => res.status(200).json({ message: 'Objet modifié'})) // Code 200 = requête client faite avec succès
    .catch((error => res.status(400).json({ error})));
};

//Suppression d'un objet
exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id }) // On sélectionne l'objet par son id en vérifiant qu'il correspond à l'id des paramètres de requête
    .then(() => res.status(200).json({message: 'Livre supprimé'}))
    .catch(error => res.status(400).json({ error}));
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