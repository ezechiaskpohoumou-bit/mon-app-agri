const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    acheteur: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    produits: [{
        produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantite: { type: Number, default: 1 }, // <--- Vérifie cette virgule
        prixUnitaire: { type: Number }           // <--- Et ici
    }],
    montantTotal: { type: Number, required: true },
    statut: { 
        type: String, 
        enum: ['en attente', 'payé', 'annulé'], 
        default: 'en attente' 
    },
    paymentId: { type: String },
    dateCommande: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);