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
const upload = multer();


var ImageDb = require('../models/image');

var User = require('../models/user');

var Article = require('../models/article');

var Configuration = require('../models/configuration');


/** TODO Mettre un middleware pour authoriser uniquement les utilisateurs avec droits admin. */
router.use('/*', (req, res, next) => {
  if ((typeof req.session.sessionUser !== "undefined") && (req.session.sessionUser.role == 1))
  {
    /* Seul un utilisateur avec le rôle d'administrateur peut se trouver dans la partie administration du site. */
    next();
  }
  else
    res.redirect('/');
});

/* Page principale de l'administration. */
router.get('/', function (req, res) {
  res.render('admin.ejs', {title: "Administration du site"});
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
  });
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
      /* TODO refaire la gestion des erreurs. */
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

/* Article admin */
router.get('/articles', function (req, res) {
  Article.find(function (err, articles) {
    if (err) console.log("Erreurs obtention des articles");
    else
    {
      console.log("Utilisateurs : " + articles);
      res.render('adminarticles.ejs', {title: "Articles", articles: articles});
    }
  })
});
/* Effacement d'un article */
router.get('/articles/delete/:id', function (req, res) {
  Article.findByIdAndRemove({_id: req.params.id}, function(err, article) {
    if (err) console.log("Erreur d'effacement de l'article");
    else res.redirect('/admin/articles');
  });
});
router.get('/articles/edit/:id', function (req, res) {
  Article.findOne({_id: req.params.id}, function(err, article) {
    if (err) console.log("Erreur de récupération de l'article pour l'édition");
    else
    {
      console.log("Article à éditer : " + article.articletitle + " " + article.contentarticle);
      res.render("adminarticles_edit.ejs", {title: "Edition d'article", article: article, helps: "undefined"});
    }
  })
});
/* Editer un article */
router.post('/articles/edit/:id', [],
  function (req, res) {
    console.log(req.body);

    /* Tentative de sauvegarde du nouvel utilisateur. */
    Article.findByIdAndUpdate(req.params.id, {$set: {contentarticle: req.body.contentarticle, articletitle: req.body.articletitle}}, function (err, article) {
      if (err)
      {
        console.log("Erreur mise à jour article : " + err);
        res.render('/admin/articles', {title: title, helps: helps});
      }
      else
      {
        res.redirect("/admin/articles");
      }
    });
  }
);

router.get('/article', (req, res) => {
  res.render('adminarticle.ejs' , {title: "Ajouter un article"});
});

router.post('/article', upload.fields([]),  (req, res, next) => {
  if(!req.body){
    return res.sendStatus(500);

  } else {
    const formData = req.body;
    console.log('formData:', formData);
    const articletitles = req.body.articletitle;
    const article = req.body.contentarticle;
    const myArticle = new Article ({ contentarticle : article , articletitle : articletitles});

                         var articleCategorie = [];
    articleCategorie = [...articleCategorie, myArticle];


    myArticle.save((err, savedArticle) => {
      if (err) {
        console.error(err);
        return;
      } else {
        console.log(savedArticle);
        res.sendStatus(201);
      }
    })

    res.sendStatus(201);

  }
})
router.get('/article/:id' , (req , res) => {
  const id = req.params.id;
  res.render('adminarticle.ejs', {articleid: id});
})
/** Configuration **/
router.get('/config',(req, res) => {
  console.log("Route configuration");
  Article.find().select('_id articletitle').exec((err, articles) => {
    if (err)
    {
      console.log("Erreur de récupération des articles : " + err);
      //res.render('configuration.ejs', {title: Configuration, articleList: "undefined"});
    }
    else
    {
      console.log("Articles trouvés : " + articles);
      res.render('configuration.ejs', {title: "Configuration", articlesList: articles});
    }
  });
});
/*router.get('/coucou', (req, res) => {
  console.log('Coucou');
  res.send("coucou");
});
router.get('/config', (req, res) => {
  console.log('Page de configuration');
  res.send("salut");
  //res.render('configuration.ejs', {title: "Configuration", articleList: "undefined"});
});*/

router.post('/config', [
    /* Vérification du champs. */
    check('articleaccueil').exists(),
  ], (req, res) => {
    const erreurs = validationResult(req);
    console.log("Id article accueil : " + req.body.articleaccueil);
    if (!erreurs.isEmpty())
    {
      console.log(erreurs.mapped());
      res.redirect('/admin');
    }
    else
    {
      /* Article de l'accueil. */
      let article = new Configuration.ObjId();
      /*article.name = "article_accueil";
      article.value = req.body.articleaccueil;
      article.save((err, article) => {*/

      
      article.update({name: "article_accueil"}, {$set: {value: req.body.articleaccueil}}, (err, larticle) => {
        if (err) console.log("Article de l'accueil pas enregistré.");
        else console.log("Article de l'accueil enrigistré : " + article);
        res.redirect('/admin');
      });
    }
});

/* Export du module. */
module.exports = router;
