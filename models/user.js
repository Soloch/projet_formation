/**
 * user.js
 *
 * Modèle pour les utilisateurs.
 */


var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


var Schema = mongoose.Schema;


/* Schema Utilisateur */
var userSchema = mongoose.Schema({
    email: {type: String, index: true, unique: true, required: true},
    password: {type: String, required: true},
    firstName: String,
    lastName: String,
    lastConnection: {type: Date, default: Date.now},
    role: Number,
    connected: Boolean
  });
userSchema.plugin(uniqueValidator);

/* Nom complet. */
var fullName = userSchema.virtual('fullname');
/* Récupération du nom complet. */
var getFullName = userSchema.get(function () {
  return this.lastName + ' ' + this.firstName;
});

/* Exportation du modèle. */
module.exports = mongoose.model('User', userSchema);

/* Exportation de la fonction de récupération du nom complet. */
module.exports.getFullName = getFullName;