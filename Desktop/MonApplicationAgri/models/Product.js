const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true },
    prix: { type: Number, required: true },
    unite: { type: String, default: 'kg' }, // ex: kg, lot, pièce
    quantite: { type: Number, required: true },
    image: { type: String, default: 'https://via.placeholder.com/300x200?text=Produit+Frais'},
    statut: { type: String, enum: ['disponible', 'épuisé'], default: 'disponible' },
    categorie: { type: String, enum: ['Légumes', 'Fruits', 'Tubercules', 'Céréales', 'Autre'], default: 'Autre' },
    agriculteur: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Lien vers l'utilisateur qui a créé le produit
        required: true 
    },
    dateAjout: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);