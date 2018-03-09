var mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
  articletitle: String,
  articledate : Date,
  articletext : String,
  articleimage: File,
  authorarticle: String,

});


module.exports = mongoose.model('Article', articleSchema);
