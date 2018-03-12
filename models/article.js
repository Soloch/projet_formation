var mongoose = require('mongoose');


const articleSchema = mongoose.Schema({
  articletitle: String,
  articledate : Date,
  articletext : String,
  articleimage: String,
  authorarticle: String,

});


module.exports = mongoose.model('Article', articleSchema);
