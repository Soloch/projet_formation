/**
 * configuration.js
 *
 * Modèle pour les données de configuration.
 */


var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

/* Schema. */
var Schema = mongoose.Schema;

/* Discriminateur. */
var options = {discriminatorKey: 'kind'};

/* Schema de Base */
var baseSchema = mongoose.Schema({
    name: {type: String, unique: true, required: true},
    date_update: {type: Date, default: Date.now},
    date_add: Date,
  }, options);
baseSchema.plugin(uniqueValidator);

/* Modèle de base. */
var Configuration = mongoose.model('Configuration', baseSchema);

/* Schema pour les chaînes de caractères. */
var Texte = Configuration.discriminator('Texte',
    new Schema({ texte: String })
  );
module.exports.Texte = Texte;

/* Schema pour les nombres. */
var Nombre = Configuration.discriminator('Nombre',
    new Schema({ nombre: Number })
  );
module.exports.Nombre = Nombre;