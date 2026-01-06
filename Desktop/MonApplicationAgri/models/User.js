const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importation de bcrypt
const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Le nom est obligatoire"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        unique: true, // Empêche deux personnes d'avoir le même email
        lowercase: true,
        trim: true
    },
    motDePasse: {
        type: String,
        required: [true, "Le mot de passe est obligatoire"],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['menage', 'agriculteur'], // Seuls ces deux rôles sont autorisés
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    dateInscription: {
        type: Date,
        default: Date.now
    },
    telephone: {
        type: String,
        required: true 
    }, 
});

// --- LOGIQUE DE SÉCURITÉ : Avant d'enregistrer ---
userSchema.pre('save', async function () {
    // Si le mot de passe n'a pas été modifié, on s'arrête là
    if (!this.isModified('motDePasse')) return;

    // Générer un "sel" et hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    // Avec async/await, pas besoin de appeler next() ici
});
// Création du modèle basé sur le schéma
const User = mongoose.model('User', userSchema);

module.exports = User;