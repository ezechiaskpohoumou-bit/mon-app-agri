const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Route pour créer une commande : POST /api/orders
router.post('/', async (req, res) => {
    try {
        const { acheteurId, items } = req.body; // items = [{produitId, quantite}, ...]

        let total = 0;
        const produitsCommandes = [];

        // Boucle pour calculer le prix total et vérifier les produits
        for (let item of items) {
            const produit = await Product.findById(item.produitId);
            if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
            
            total += produit.prix * item.quantite;
            produitsCommandes.push({
                produit: produit._id,
                quantite: item.quantite,
                prixUnitaire: produit.prix
            });
        }

        const nouvelleCommande = new Order({
            acheteur: acheteurId,
            produits: produitsCommandes,
            montantTotal: total
        });

        await nouvelleCommande.save();

        // ICI : Plus tard, on ajoutera l'appel vers FedaPay/CinetPay pour obtenir le lien de paiement
        res.status(201).json({ 
            message: "Commande créée, en attente de paiement", 
            commandeId: nouvelleCommande._id,
            total: total 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route de notification (Webhook) : POST /api/orders/webhook
router.post('/webhook', async (req, res) => {
    try {
        // 1. On reçoit les infos du paiement (le format dépend de FedaPay/CinetPay)
        const { status, orderId, transactionId } = req.body;

        if (status === 'approved' || status === 'SUCCESS') {
            // 2. On cherche la commande dans MongoDB
            const commande = await Order.findById(orderId);

            if (commande) {
                // 3. On met à jour le statut
                commande.statut = 'payé';
                commande.paymentId = transactionId;
                await commande.save();
                
                console.log(`✅ Paiement confirmé pour la commande ${orderId}`);
            }
        }

        // On répond toujours "OK" à la plateforme de paiement
        res.status(200).send('Notification reçue');

    } catch (error) {
        console.error("Erreur Webhook:", error.message);
        res.status(500).send('Erreur');
    }
});

// Voir les commandes reçues (pour l'agriculteur)
router.get('/vendeur/:vendeurId', async (req, res) => {
    try {
        // On cherche les commandes qui contiennent au moins un produit de cet agriculteur
        const commandes = await Order.find({ 'produits.vendeur': req.params.vendeurId })
                                     .populate('acheteur', 'nom telephone adresse');
        res.json(commandes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;