var mongoose = require('mongoose');
const multer = require('multer');
const upload = multer;
let listArticle = [];

const articleSchema = mongoose.Schema({
  articletitle : String,
  contentarticle : String,
  articledate : {type: Date , default: Date.now},


});



module.exports = mongoose.model('Article', articleSchema);
