const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // 1. Récupérer le token dans l'en-tête de la requête
        const token = req.headers.authorization.split(' ')[1];
        
        // 2. Vérifier si le token est valide
        const decodedToken = jwt.verify(token, "NOTRE_CLE_SECRETE_TRES_LONGUE");
        
        // 3. Ajouter les infos de l'utilisateur à la requête pour la suite
        req.auth = { userId: decodedToken.id };
        
        // 4. On laisse passer à l'étape suivante
        next();
    } catch (error) {
        res.status(401).json({ erreur: "Requête non authentifiée !" });
    }
};