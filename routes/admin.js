/**
 * admin.js
 * 
 * Routeur pour l'administration.
 */


const express = require('express');
const router = express.Router();
const multer = require('multer');
const uuidV1 = require('uuid/v1');
const {body, check, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const validator = require('express-validator');


var ImageDb = require('../models/image');

var UserDb = require('../models/user');


/*router.use('../css' , express.static('assets/css'));
router.use('../js' , express.static('assets/js'));
router.use('../img' , express.static('assets/img'));*/

/** TODO Mettre un middleware pour authoriser uniquement les utilisateurs avec droits admin. */

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

/** Utilisateurs. **/
/* Affichage liste utilisateurs. */
router.get('/users', function (req, res) {
  UserDb.find(function (err, users) {
    if (err) console.log("Erreurs obtention utilisateurs");
    else
    {
      console.log("Utilisateurs : " + users);
      res.render('users.ejs', {title: "Utilisateurs", users: users});
    }
  })
});

/* Page d'édition d'un utilisateur. */
router.get('/user/edit/:id', function (req, res) {
  UserDb.findOne({_id: req.params.id}, function(err, user) {
    if (err) console.log("Erreur de récupération de l'utilisateur pour l'édition");
    else
    {
      console.log("Utilisateur à éditer : " + user.lastName + " " + user.firstName);
      res.render("user_edit.ejs", {title: "edition", user: user, helps: "undefined"});
    }
  })
});

/* Édition d'un utilisateur. */
router.post('/user/edit/:id', [
    /* Vérification des champs. */
    check('lastname').exists(),
    check('firstname').exists(),
    check('email').isEmail().withMessage('Doit être un email').trim(),
    check('password').isLength({min: 5}).withMessage('Le mot de passe doit avoir une longueur de 5 caractères au minimum'),
    check('confirmPassword').isLength({min: 5}).withMessage('Le mot de passe de confirmation doit avoir une longueur de 5 caractères au minimum')
  ],
  function (req, res) {
    const erreurs = validationResult(req);
    let title = "Échec de l'inscription";
    let helps = {};
    /* Présence d'erreurs. */
    if (!erreurs.isEmpty())
    {
      erreurs.mapped().foreach((erreur) => {
        helps[erreur] = erreur.msg;
      });
      console.log(erreurs.mapped());
      res.render('user_edit.ejs', {title: title, helps: helps});
    }
    else
    {
      /* Création du nouvel utilisateur. */
      let machin = new User();
      machin.lastName = req.body.lastname;
      machin.firstName = req.body.firstname;
      machin.email = req.body.email;
      machin.password = req.body.password;
      machin.role = 0;
      machin.connected = true;

      /* Tentative de sauvegarde du nouvel utilisateur. */
      machin.save(function (err) {
        if (err)
        {
          helps['email'] = "L'adresse email est déjà utilisée";
        }
        else
        {
            
        }
        res.render('inscription.ejs', {title: title, helps: helps});
      });
    }
  }
);

/* Effacement d'un utilisateur. */
router.get('/users/delete/:id', function (req, res) {
  UserDb.findByIdAndRemove({_id: req.params.id}, function(err, user) {
    if (err) console.log("Erreur d'effacement de l'utilisateur.");
    else res.redirect('/admin/users');
  });
});


/* Export du module. */
module.exports = router;