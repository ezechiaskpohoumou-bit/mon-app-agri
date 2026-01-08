const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// 1. AJOUTER UN PRODUIT
router.post('/add', auth, async (req, res) => {
    try {
        const { nom, categorie, description, prix, unite, quantite, image } = req.body;

        const nouveauProduit = new Product({
            nom,
            categorie,
            description,
            prix,
            unite,
            quantite,
            image: image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
            agriculteur: req.auth.userId 
        });

        await nouveauProduit.save();
        res.status(201).json({ message: "Produit ajouté avec succès !", produit: nouveauProduit });
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de l'ajout", erreur: error.message });
    }
});

// 2. VOIR TOUS LES PRODUITS (Corrigé ici)
router.get('/', async (req, res) => {
    try {
        // Correction : On ferme bien la parenthèse du populate et on met un point-virgule
        const produits = await Product.find().sort({ createdAt: -1 }).populate('agriculteur', 'nom email');
        res.status(200).json(produits);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération", erreur: error.message });
    }    
});

// 3. VOIR UNIQUEMENT MES PRODUITS
router.get('/my-products', auth, async (req, res) => {
    try {
        const mesProduits = await Product.find({ agriculteur: req.auth.userId });
        res.json(mesProduits);
    } catch (error) {
        res.status(500).json({ erreur: error.message });
    }
});

// 4. MODIFIER UN PRODUIT
router.put('/:id', auth, async (req, res) => {
    try {
        let produit = await Product.findById(req.params.id);
        if (!produit) return res.status(404).json({ erreur: "Produit non trouvé" });

        if (produit.agriculteur.toString() !== req.auth.userId) {
            return res.status(403).json({ erreur: "Action non autorisée" });
        }

        if (req.body.quantite !== undefined) {
            req.body.statut = req.body.quantite <= 0 ? 'épuisé' : 'disponible';
        }

        const produitModifie = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Produit mis à jour !", produit: produitModifie });
    } catch (error) {
        res.status(500).json({ erreur: error.message });
    }
});

// 5. SUPPRIMER UN PRODUIT
router.delete('/:id', auth, async (req, res) => {
    try {
        const produit = await Product.findById(req.params.id);
        if (!produit) return res.status(404).json({ erreur: "Produit non trouvé" });

        if (produit.agriculteur.toString() !== req.auth.userId) {
            return res.status(403).json({ erreur: "Non autorisé" });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Produit supprimé avec succès !" });
    } catch (error) {
        res.status(500).json({ erreur: error.message });
    }
});

module.exports = router;
