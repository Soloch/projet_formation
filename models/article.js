var mongoose = require('mongoose');
const multer = require('multer');
const upload = multer;
let listArticle = [];

const articleSchema = mongoose.Schema({
  contentarticle : Array,
  articledate : {type: Date , default: Date.now},


});



module.exports = mongoose.model('Article', articleSchema);
