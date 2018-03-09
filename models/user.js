/**
 * user.js
 * 
 * Modèle pour les utilisateurs.
 */


var mongoose = require('mongoose');


var Schema = mongoose.Schema;


/* Schema Utilisateur */
var userSchema = mongoose.Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    lastConnection: {type: Date, default: Date.now},
    role: Number,
    connected: Boolean
  });

/* Exportation du modèle. */
module.exports = mongoose.model('User', userSchema);