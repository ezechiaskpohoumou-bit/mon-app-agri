const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Route pour ajouter un produit : POST http://localhost:4000/api/products/add
router.post('/add',auth, async (req, res) => {
    try {
        const { nom, description, prix, unite, quantite, agriculteurId } = req.body;

        const nouveauProduit = new Product({
            nom,
            description,
            prix,
            unite,
            quantite,
            agriculteur: agriculteurId // On utilise l'ID de l'agriculteur
        });

        await nouveauProduit.save();
        res.status(201).json({ message: "Produit ajouté avec succès !", produit: nouveauProduit });
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de l'ajout du produit", erreur: error.message });
    }
});
// Route pour voir TOUS les produits : GET http://localhost:4000/api/products
router.get('/', async (req, res) => {
    try {
        // .populate('agriculteur', 'nom adresse') permet de récupérer 
        // les infos de l'agriculteur au lieu de juste son ID
        const produits = await Product.find().populate('agriculteur', 'nom adresse');
        
        res.status(200).json(produits);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération", erreur: error.message });
    }    
});
// Voir uniquement MES produits (pour l'agriculteur connecté)
// GET http://localhost:4000/api/products/my-products
router.get('/my-products', auth, async (req, res) => {
    try {
        // req.auth.userId vient du garde du corps (middleware) !
        const mesProduits = await Product.find({ agriculteur: req.auth.userId });
        res.json(mesProduits);
    } catch (error) {
        res.status(500).json({ erreur: error.message });
    }
});
// Supprimer un produit
// DELETE http://localhost:4000/api/products/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const produit = await Product.findById(req.params.id);

        if (!produit) {
            return res.status(404).json({ erreur: "Produit non trouvé" });
        }

        // Vérification : Est-ce que ce produit appartient bien à l'agriculteur connecté ?
        if (produit.agriculteur.toString() !== req.auth.userId) {
            return res.status(403).json({ erreur: "Vous n'avez pas le droit de supprimer ce produit" });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Produit supprimé avec succès !" });
    } catch (error) {
        res.status(500).json({ erreur: error.message });
    }
});
// Modifier un produit existant
// PUT http://localhost:4000/api/products/:id
router.put('/:id', auth, async (req, res) => {
    try {
        let produit = await Product.findById(req.params.id);

        if (!produit) return res.status(404).json({ erreur: "Produit non trouvé" });

        // Sécurité : Vérifier que c'est bien le propriétaire qui modifie
        if (produit.agriculteur.toString() !== req.auth.userId) {
            return res.status(403).json({ erreur: "Action non autorisée" });
        }

        // On met à jour avec les nouvelles données envoyées
        produit = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        res.json({ message: "Produit mis à jour !", produit });
    } catch (error) {
        res.status(500).json({ erreur: error.message });
    }
});
module.exports = router;