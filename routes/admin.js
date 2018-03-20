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

var User = require('../models/user');


/*router.use('../css' , express.static('assets/css'));
router.use('../js' , express.static('assets/js'));
router.use('../img' , express.static('assets/img'));*/

/** TODO Mettre un middleware pour authoriser uniquement les utilisateurs avec droits admin. */
router.use('/*', (req, res, next) => {
  if ((typeof req.session.sessionUser !== "undefined") && (req.session.sessionUser.role == 1))
    next();
  else
    res.redirect("/");
});

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
  User.find(function (err, users) {
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
  User.findOne({_id: req.params.id}, function(err, user) {
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
    check('userrole').exists().isDecimal()
  ],
  function (req, res) {
    console.log(req.body);
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
      res.send(erreurs);
    }
    else
    {
      /* Mise à jour des informations sur l'utilisateur. */
      let utilisateur = new User();
      utilisateur.lastName = req.body.lastname;
      utilisateur.firstName = req.body.firstname;
      utilisateur.role = Number(req.body.userrole);

      console.log("Utilisateur : " + utilisateur);

      /* Tentative de sauvegarde du nouvel utilisateur. */
      User.findByIdAndUpdate(req.params.id, {$set: {lastName: req.body.lastname, firstName: req.body.firstname, role: Number(req.body.userrole)}}, function (err, utilisateur) {
        if (err)
        {
          console.log("Erreur mise à jour utilisateur" + err);
          res.render('inscription.ejs', {title: title, helps: helps});
        }
        else
        {
          res.redirect("/admin/users");
        }
      });
      //res.send("Mise à jour effectuée");
      //res.contentType('application/json');
      //res.json({id: req.params.id});
    }
  }
);

/* Effacement d'un utilisateur. */
router.get('/users/delete/:id', function (req, res) {
  User.findByIdAndRemove({_id: req.params.id}, function(err, user) {
    if (err) console.log("Erreur d'effacement de l'utilisateur.");
    else res.redirect('/admin/users');
  });
});


/* Export du module. */
module.exports = router;