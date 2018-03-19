/**
 * image.js
 *
 * Modèle pour les images.
 */


var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


var Schema = mongoose.Schema;


/* Schema Configuration. */
var imageSchema = mongoose.Schema({
    name: {type: String, index: true, unique: true, required: true},
    originalName: String,
    image: Buffer,
    contentType: String,
    date_update: {type: Date, default: Date.now},
    date_add: {type: Date},
  });
imageSchema.plugin(uniqueValidator);
/* Modèle Configuration. */
module.exports.Image = mongoose.model('Image', imageSchema);