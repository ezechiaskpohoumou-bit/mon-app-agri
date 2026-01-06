const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// On garde bcrypt uniquement pour la comparaison du login
const bcrypt = require('bcryptjs'); 

// Route pour l'inscription
router.post('/register', async (req, res) => {
    try {
        const { nom, email, telephone, motDePasse, role, adresse } = req.body;

        // On crée l'utilisateur SIMPLEMENT. 
        // Le modèle s'occupera de hacher 'motDePasse' automatiquement.
        const nouvelUtilisateur = new User({
            nom,
            email,
            telephone,
            motDePasse, // On l'envoie "en clair" au modèle
            role,
            adresse
        });

        await nouvelUtilisateur.save();

        res.status(201).json({ 
            message: "Utilisateur créé avec succès !",
            utilisateur: { nom, email, role } 
        });

    } catch (error) {
    // Cela va afficher l'erreur détaillée dans ton terminal noir
    console.log("DÉTAIL DE L'ERREUR :");
    console.log(error); 
    res.status(400).json({ message: "Erreur lors de l'inscription", erreur: error.message });
}
});

// Route de Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        const utilisateur = await User.findOne({ email });
        if (!utilisateur) {
            return res.status(400).json({ erreur: "Utilisateur non trouvé" });
        }

        // Ici bcrypt est indispensable pour comparer
        const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
        if (!motDePasseValide) {
            return res.status(400).json({ erreur: "Mot de passe incorrect" });
        }

        const token = jwt.sign(
            { id: utilisateur._id, role: utilisateur.role },
            process.env.JWT_SECRET || "NOTRE_CLE_SECRETE_TRES_LONGUE",
            { expiresIn: '24h' }
        );

        res.json({ 
            message: "Connexion réussie !", 
            token: token, 
            utilisateur: { nom: utilisateur.nom, role: utilisateur.role, id: utilisateur._id } 
        });

    } catch (error) {
        res.status(500).json({ erreur: error.message });
    }
});

module.exports = router;