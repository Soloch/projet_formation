/**
 * admin.js
 * 
 * Routeur pour l'administration.
 */


const express = require('express');
const router = express.Router();
const multer = require('multer');
const uuidV1 = require('uuid/v1');


var ImageDb = require('../models/image');


/*router.use('../css' , express.static('assets/css'));
router.use('../js' , express.static('assets/js'));
router.use('../img' , express.static('assets/img'));*/


/* Page principale de l'administration. */
router.get('/', function (req, res) {
  res.render('admin.ejs', {title: "Enregistrement d'une photo"});
});

/*  */
router.get('/image', function (req, res) {
    res.render('adminimage.ejs', {title: "Affichage d'une image provenant de la base de données."});
  });
  
/* Page de dépôt d'une image. */
router.post('/image', multer({storage: multer.memoryStorage()}).single('image'), function (req, res) {
  let image = new ImageDb.Image();
  image.originalName = req.file.originalname;
  image.name = uuidV1();
  console.log("Fichier photo mimetype : " + req.file.originalname);
  image.contentType = req.file.mimetype;
  image.image = req.file.buffer;
  image.save(function(err, image) {
    if (err) console.log("Erreur d'enregistrement de l'image");
    else
    {
      console.log("Image enregistrée");
      res.send(image);
    }
  })
  //res.contentType(req.file.mimetype);
  //res.send(req.file.buffer.data);
  //res.redirect('back');
});

/* Gestion des images. */
router.get('/images', function (req, res) {
  
  res.render('images.ejs', {title: "Images"});
});

router.get('/images/:name', function (req, res) {
  ImageDb.Image.findOne({name: req.params.name}, function (err, image) {
    if (err) console.log("erreur récupération image : " + err);
    else
    {
      //console.log(image.contentType);
      res.contentType(image.contentType);
      res.end(image.image, 'binary');
    }
  })
});

/* Récupérer des images à l'intérieur d'un intervalle. */
router.get('/images/from/:from/to/:to', function (req, res) {
  ImageDb.Image.find().select('name originalName _id').skip(parseInt(req.params.from)).limit(parseInt(req.params.to)).exec(function (err, images) {
    if (err) console.log("Erreur de récupération des images avec offset " + req.params.from + " et limite " + req.params.to + " : " + err);
    else
    {
      res.send(images);
    }
  });
});

/* Recherche d'images selon un nom. */
router.get('/images/find/:name/from/:from/to/:to', function (req, res) {
  ImageDb.Image.find({originalName: new RegExp(req.params.name, "i")}).select('originalName name _id').skip(parseInt(req.params.from)).limit(parseInt(req.params.to)).exec(function (err, images) {
    if (err) console.log("Erreur de récupération des images avec offset " + req.params.from + " et limite " + req.params.to + " : " + err);
    else
    {
      console.log("Recherche nom : " + req.params.name);
      console.log("Images trouvées : " + images);
      res.send(images);
    }
  });
});

/** Configuration. **/
router.get('/configuration', function (req, res) {
  res.render('configuration.ejs', {title: "Configuration"});
});


/* Export du module. */
module.exports = router;