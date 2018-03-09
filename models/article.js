var mongoose = require('mongoose');

<<<<<<< HEAD
=======

>>>>>>> b25e85eb18f9bab30a265e1dd5d4b6ac6b299944
const articleSchema = mongoose.Schema({
  articletitle: String,
  articledate : Date,
  articletext : String,
<<<<<<< HEAD
  articleimage: File,
=======
  articleimage: String,
>>>>>>> b25e85eb18f9bab30a265e1dd5d4b6ac6b299944
  authorarticle: String,

});


module.exports = mongoose.model('Article', articleSchema);
