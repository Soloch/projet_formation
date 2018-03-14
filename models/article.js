var mongoose = require('mongoose');
const multer = require('multer');
const upload = multer;
let listArticle = [];

const articleSchema = mongoose.Schema({
  articletitle: String,
  articledate : {type: Date , default: Date.now},
  articletext : String,
  articleimage: Buffer,
  authorarticle: String,

});



module.exports = mongoose.model('Article', articleSchema);
