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
const PORT = 80;
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
app.use(bodyParser.json());
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
  if (typeof req.session.sessionUser !== "undifined")
  {
    /* L'utilisateur est ajouté dans les variables locales de la réponse. */
    res.locals.sessionUser = req.session.sessionUser;
    console.log("res.locals.sessionUser : " + res.locals.sessionUser);
  }
  next();
});

/* Routes pour l'administration. */
var admin = require('./routes/admin');
app.use('/admin', admin);
/* Routes pour la partie frontale. */
var front = require('./routes/front');
app.use('/', front);

/* Page erreur 404. */
app.use(function (req, res, next) {
  res.status(404).render('404.ejs', {title: "Page introuvable"});
});

app.listen(PORT, ()=> {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
