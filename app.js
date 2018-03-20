const express = require('express')
const app = express();
const multer = require('multer');
const upload = multer();

// Générateur de faux contenu
const faker = require('faker');

// GESTION DE LA DB
const mongoose = require('mongoose');
/* Gestionnaire d'erreurs pour MongoDB. */
mongoose.connection.on('error', function(err) {
  console.error('MongoDB Error: ', err);
});
mongoose.connect('mongodb://pandacious:gallad59282@ds261138.mlab.com:61138/mediatemplate');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connection : Impossible de se connecter à la base de donnée'));
db.once('open', ()=> {
  console.log('Vous êtes connecté à la base de données. GG.');
});

/* Mailer */
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mediatemplate.project@gmail.com',
    pass: 'webforce3'
  }
});

/** Inclusion des modèles **/
var User = require('./models/user');

var Article = require('./models/article');

var Configuration = require('./models/configuration');

var ImageDb = require('./models/image');


const fs = require('fs');
const PORT = 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const gooseSession = require('goose-session');
const {body, check, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const validator = require('express-validator');

app.set('views' , './views');
app.set('view engine' , 'ejs');

app.use('/css' , express.static('assets/css'));
app.use('/js' , express.static('assets/js'));
app.use('/img' , express.static('assets/img'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));

// GESTION DES ARTICLES

/*
app.post('/adminarticle' ,  (req , res) => {
  console.log('Image de l\'article :', req.body.articleimage);
  console.log('Le titre :',req.body.articletitle);
  console.log('Contenu :',req.body.articletext);
  console.log('La date :',req.body.articledate);
  console.log('L\'auteur :',req.body.authorarticle);
  const newArticle = { title: req.body.articletitle,
                       content: req.body.articletext,
                       date: req.body.articledate,
                       author: req.body.authorarticle,
                       image: req.body.articleimage};

listArticle = [...frenchMovies, newArticle];
console.log(listArticle);

  res.sendStatus(201);
});
*/
app.get('/adminarticle', (req , res) => {
  const newArticle = { title: req.body.articletitle,
                       content: req.body.articletext,
                       date: req.body.articledate,
                       author: req.body.authorarticle,
                       image: req.body.articleimage};
  articleCategorie = [];
  res.render('adminarticle.ejs' , {title: "Ajouter un article"});
});

app.post('/', upload.fields([]),  (req, res, next) => {
  if(!req.body){
    return res.sendStatus(500);

  } else {
    const formData = req.body;
    console.log('formData:', formData);
    const title = req.body.articletitle;
    const image = req.body.articleimage;
    const content = req.body.articletext;
    const date = req.body.articledate;
    const author = req.body.authorarticle;
    const myArticle = new Article ({ articletitle : title, articleimage : image, articletext : content, articledate : date , authorarticle : author});

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
app.get('/adminarticle/:id' , (req , res) => {
  const id = req.params.id;
  res.render('adminarticle', {articleid: id});
})


// FIN GESTION DES ARTICLES

/* Affichage d'une image avec son nom. */
/* N'a pas besoin du système de session. */
app.get('/images/:name', function (req, res) {
  console.log("Demande d'une image.");
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

/* Middleware pour la gestion des sessions. */
app.use(session({
  /* Utilisation de goose-session. */
  store: gooseSession(mongoose, {
    collection: 'sessions',
    expireAfter: '3d'
  }),

  /* Configuration de la session. */
  secret: 'jaipascompris',
  name: 'sessionId',
  rolling: true,
  saveUninitialized: false,
  unset: 'destroy',
  cookie: {path: '/', httpOnly: true, secure: false, maxAge: 2628000000}
}));

/* Middleware pour répondre l'objet «utilisateur» s'il existe. */
app.use('/*', (req, res, next) => {
  if (typeof req.session.userName !== "undifined")
  {
    /* L'utilisateur est ajouté dans les variables locales de la réponse. */
    /** TODO remplacer par sessionUser et mettre à jour le comportement partout. */
    res.locals.user = req.session.user;
    //console.log("res.locals.user : " + req.session.user);
  }
  next();
});



/* Accueil */
app.get('/', (req, res)=> {
  let title = "Accueil";
  myArticle = [];
  Article.find((err , articles) => {
    if(err){
      console.error('Impossible de récupérer les articles depuis la DB');
      res.sendStatus(500);
    } else {
      myArticle = articles;
      res.render('index.ejs',{title: req.session.userName , articles: myArticle});
    }
  });
});



// Page de contact
app.get('/contact', (req, res) => {
  res.render('contact.ejs', {title: "Contact"});
});

app.get ('/inscription', (req, res) => {
  res.render('inscription.ejs', {title: "Inscription", helps: {}});
});

app.post('/inscription', [
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
          }
          res.render('inscription.ejs', {title: title, helps: helps});
        });
      }
    }
});

app.get('/welcome', (req, res) => {
  res.render('welcome.ejs', {title: "Bienvenue"});
});

app.get('/login', (req, res) => {
  res.render('login.ejs', {title: "Connexion", erreurs: "Entrez votre email et votre mot de passe"});
});



app.get('/article' , (req , res) => {
  res.render('article.ejs' , {title: "Articles"});
});

/* Post pour le login. */
app.post('/login', [
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
    /* Création histoire d'avoir quelquechose à controller. */
    /*var tata = new User();
    tata.email = "tata@tete.titi";
    tata.password = "totote";
    tata.firstName = "tata";
    tata.lastName = "tete";
    tata.role = 1;
    tata.connected = true;
    tata.save(function(err) {
      if (err) res.send(err);
      res.send({message: "Tata enregistrée !"});
    });*/
    /* Contrôle de l'identité de l'utilisateur. */
      User.findOne({email: req.body.email}, function(err, user) {
        if (err) throw err;

      console.log("user : " + user);
      if (user)
      {
        console.log("session user");
        /* Contrôle du mot de passe. */
        if (req.body.password == user.password)
        {
          req.session.user = user;
        }

        res.redirect("back");
      }
    });
  }
});

var admin = require('./routes/admin');

app.use('/admin', admin);

/* Page d'administration. */
/*app.get('/admin', function (req, res) {
  res.render('admin.ejs', {title: "Enregistrement d'une photo"});
});*/
/*
app.get('/admin/image', function (req, res) {
  res.render('adminimage.ejs', {title: "Affichage d'une image provenant de la base de données."});
});*/

/* Page de configuration. *//*
app.post('/admin/image', multer({storage: multer.memoryStorage()}).single('photo'), function (req, res) {
  let image = new ImageDb.Image();
  image.name = req.file.originalname;
  console.log("Fichier photo mimetype : " + req.file.originalname);
  image.contentType = req.file.mimetype;
  image.image = req.file.buffer;
  image.save(function(err) {
    if (err) console.log("Erreur d'enregistrement de l'image");
    else console.log("Image enregistrée");
  });
  //res.contentType(req.file.mimetype);
  //res.send(req.file.buffer.data);
  res.redirect('/admin');
});

app.get('/admin/image/test', function (req, res) {
  ImageDb.Image.findOne({name: 'hua-mg-yumeiren4.jpg'}, function (err, doc) {
    if (err) console.log("erreur récupération image : " + err);
    else
    {
      console.log(doc.contentType);
      res.contentType(doc.contentType);
      res.end(doc.image, 'binary');
    }
  })
});*/

/* Page de login. */
app.get('/login', function (req, res) {

  res.send('login');
});

/* Articles. */
app.get('/article/:nom', function (req, res) {
  res.send(`article ${req.params.nom}`);
});

/* Déconnection */
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('back');
});

/* Page erreur 404. */
app.use(function (req, res, next) {
  res.status(404).render('404.ejs', {title: "Page introuvable"});
});

app.listen(PORT, ()=> {
    console.log(`Serveur lancé sur le port ${PORT}`);

});
