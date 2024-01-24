const mongoose = require('mongoose');

// Définition du schéma du modèle Admin
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Méthode pour vérifier le mot de passe
adminSchema.methods.verifierMotDePasse = function(password) {
  const admin = this;
  return password === admin.password; // Comparaison directe sans hachage
};

// Création du modèle Admin à partir du schéma
const Admin = mongoose.model('Admin', adminSchema);

// Exportation du modèle Admin
module.exports = Admin;
