// 1. Charger les variables d'environnement (comme MONGO_URI et PORT)
require('dotenv').config();

// 2. Importer les dépendances

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orderRoutes'); // Importation de la route
const authRoutes = require('./routes/authRoutes'); // Ajoute cette ligne !
const productRoutes = require('./routes/productRoutes'); // <--- La pièce manquante !
dotenv.config();

const app = express();

// --- Configuration du Port ---
const port = process.env.PORT || 3000; // Utilise le port du fichier .env (4000) ou 3000 par défaut

// --- Middleware (Intergiciel) de base ---
// Permet à l'application de lire le JSON envoyé dans les requêtes
app.use(express.json());
app.use(express.static('public'));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


// --- Exemple de Route (pour tester le serveur) ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bienvenue sur AgriConnect API ! Le serveur fonctionne.' });
});


// --- 4. Connexion à la Base de Données et Démarrage du Serveur ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // La connexion à MongoDB est réussie, on peut démarrer le serveur
        console.log('✅ Connexion à MongoDB Atlas établie avec succès.');
        
        app.listen(port, () => {
            console.log(`🚀 Serveur en écoute sur le port : http://localhost:${port}`);
        });
    })
    .catch((error) => {
        // Si la connexion échoue
        console.error('❌ ERREUR DE CONNEXION À MONGODB :', error.message);
    });