/**
 * front.js
 *
 * Routeur pour la partie frontale du site.
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

var Article = require('../models/article');

/* Middleware pour envoyer la liste des articles dans le menu «Arcticles» de la navbar. */
router.use('/*', (req, res, next) => {
  Article.find().select('_id articletitle').exec(function (err, articles) {
    if (err)
    {
      console.log("Erreur de récupération des articles avec offset : " + err);
      next();
    }
    else
    {
      console.log("Articles trouvés : " + articles);
      res.locals.articlesList = articles;
      next();
    }
  });
});

/* Accueil */
router.get('/', (req, res)=> {
  let title = "Accueil";
  myArticle = [];
  Article.find((err , articles) => {
    if(err){
      console.error('Impossible de récupérer les articles depuis la DB');
      res.sendStatus(500);
    }
    else
    {
      myArticle = articles;
      res.render('index.ejs',{title: title, articles: myArticle});
    }
  });
});

// Page de contact
router.get('/contact', (req, res) => {
  res.render('contact.ejs', {title: "Contact"});
});
  
router.get ('/inscription', (req, res) => {
  res.render('inscription.ejs', {title: "Inscription", helps: {}});
});
  
router.post('/inscription', [
    /* Vérification des champs. */
    check('lastname').exists(),
    check('firstname').exists(),
    check('email').isEmail().withMessage('Doit être un email').trim(),
    check('password').isLength({min: 5}).withMessage('Le mot de passe doit avoir une longueur de 5 caractères au minimum'),
    check('confirmPassword').isLength({min: 5}).withMessage('Le mot de passe de confirmation doit avoir une longueur de 5 caractères au minimum')
  ], (req, res) => {
    const erreurs = validationResult(req);
    let title = "Échec de l'inscription";
    var helps = {};
    /* Présence d'erreurs. */
    if (!erreurs.isEmpty())
    {
      erreurs.mapped().foreach((erreur) => {
        helps[erreur] = erreur.msg;
      });
      console.log(erreurs.mapped());
       res.render('inscription.ejs', {title: title, helps: helps});
    }
    else
    {
      /* Vérification de la correspondance des 2 mots de passe. */
      if (req.body.password != req.body.confirmPassword)
      {
        console.log("Mots de passe différents !");
        helps['confirm'] = "Mots de passe différents !";
        res.render('inscription.ejs', {title: title, helps: helps});
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
              /* Bienvenue. */
              title = "Bienvenue " + machin.firstName + " " + machin.lastName;
  
              /* Envoi de l'email de bienvenue. */
              let mailOptions = {
                from: '"Media Template" <mediatemplate.project@gmail.com>',
                to: req.body.email,
                subject: "Bienvenue !",
                text: "Bienvenue chez Media Template !"
              };
              transporter.sendMail(mailOptions, (error, info) => {
                if (error)
                  return console.log(error);
              });
  
              return res.redirect('/welcome');
            }
        res.render('inscription.ejs', {title: title, helps: helps});
      });
    }
  }
});

/* Page de bienvenue suite à l'inscription. */
router.get('/welcome', (req, res) => {
  res.render('welcome.ejs', {title: "Bienvenue"});
});
  
  
/** Connexion. **/
/* Page de connexion. */
router.get('/login', (req, res) => {
  res.render('login.ejs', {title: "Connexion", erreurs: "Entrez votre email et votre mot de passe"});
});
  
/* Post pour le login. */
router.post('/login', [
      /* Vérification email et mot de passer. */
      check('email').isEmail().withMessage('Doit être un email').trim(),
      check('password').isLength({min: 5}).withMessage('Le mot de passe doit avoir une longueur de 5 caractères au minimum')
    ], (req, res, next) => {
      const erreurs = validationResult(req);
      if (!erreurs.isEmpty())
      {
        res.redirect('/');
        console.log(erreurs.mapped());
      }
      else
      {
        /* Contrôle de l'identité de l'utilisateur. */
        User.findOne({email: req.body.email}, function(err, user) {
        if (err) throw err;
  
        /* Utilisateur trouvé. */
        if (user)
        {
          console.log("session user");
          /* Contrôle du mot de passe. */
        if (req.body.password == user.password)
        {
          console.log("Utilisateur : " + user);
          req.session.sessionUser = user;
        }
        res.redirect("back");
      }
    });
  }
});
  
router.get('/article/:id' , (req , res) => {
  Article.findOne({_id: req.params.id}, function(err, article) {
    if (err) console.log("Erreur de récupération de l'article pour l'affichage.");
    else
    {
      res.render("article.ejs", {title: article.articletitle, article: article});
    }
  });
});

/* Déconnection */
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('back');
});

/* Export du module. */
module.exports = router;