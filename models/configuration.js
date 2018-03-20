/**
 * configuration.js
 *
 * Modèle pour les éléments de configuration.
 */


var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


var Schema = mongoose.Schema;


/* Options. */
var options = {discriminatorKey: 'kind'};


/* Schema Configuration. */
var configurationSchema = mongoose.Schema({
    name: {type: String, index: true, unique: true, required: true},
    date_update: {type: Date, default: Date.now},
    date_add: {type: Date},
  }, options);
configurationSchema.plugin(uniqueValidator);
/* Modèle Configuration. */
var Configuration = mongoose.model('Configuration', configurationSchema);

/* Modèle Texte. */
module.exports.Texte = Configuration.discriminator('Texte',
  new mongoose.Schema({value: String}, options));

/* Modèle Nombre. */
module.exports.Nombre = Configuration.discriminator('Nombre',
  new mongoose.Schema({value: Number}, options));

/* Modèle Date. */
module.exports.Date = Configuration.discriminator('Date',
  new mongoose.Schema({value: Date}, options));

/* Modèle ObjectId. */
module.exports.ObjId = Configuration.discriminator('ObjectId',
  new mongoose.Schema({value: Schema.Types.ObjectId}, options));