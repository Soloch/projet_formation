var mongoose = require('mongoose');
const multer = require('multer');
const upload = multer;
let listArticle = [];

const articleSchema = mongoose.Schema({
  articletitle: String,
  articledate : Date,
  articletext : String,
  articleimage: String,
  authorarticle: String, 

});



module.exports = mongoose.model('Article', articleSchema);
