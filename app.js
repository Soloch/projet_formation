const express = require('express')
const app = express();

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

app.post('/index' ,  (req , res) => {
  console.log('Image de l\'article :', req.body.articleimage);
  console.log('Le titre :',req.body.articletitle);
  console.log('Contenu :',req.body.articletext);
  console.log('La date :',req.body.articledate);
  console.log('L\'auteur :',req.body.authorarticle);
  res.sendStatus(201);
});




// FIN GESTION DES ARTICLES

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
    res.locals.user = req.session.user;
    //console.log("res.locals.user : " + req.session.user);
  }
  next();
});



/* Accueil */
app.get('/', (req, res)=> {
  let title = "Accueil";
  res.render(
    'index.ejs',
    {title: req.session.userName});
});
// Page de contact
app.get('/contact', (req, res) => {
  res.render('contact.ejs', {title: "Contact"});
});

app.get ('/inscription', (req, res) => {
  res.render('inscription.ejs', {title: "Inscription"});
});

app.post('/inscription', [
  /* Vérification des champs. */
  check('lastname').exists(),
  check('firstname').exists(),
  check('email').isEmail().withMessage('Doit être un email').trim().normalizeEmail(),
  check('password').isLength({min: 5}).withMessage('Le mot de passe doit avoir une longueur de 5 caractères au minimum'),
  check('confirmPassword').isLength({min: 5}).withMessage('Le mot de passe de confirmation doit avoir une longueur de 5 caractères au minimum')
  ], (req, res) => {
    const erreurs = validationResult(req);
    let title = "Échec de l'inscription";
    let helps = {};
    /* Présence d'erreurs. */
    if (!erreurs.isEmpty())
    {
      res.redirect('/inscription');
      console.log(erreurs.mapped());
    }
    else
    {
      /* Vérification de la correspondance des 2 mots de passe. */
      if (req.body.password != req.body.confirmPassword)
      {
        console.log("Mots de passe différents !");
        helps['passwords'] = "Mots de passe différents !";
      }
      else
      {
        /* Création du nouvel utilisateur. */
        let machin = new User();
        machin.lastName = req.body.lastname;
        machin.firstName = req.body.firstname;
        machin.email = req.body.email;
        machin.password = req.body.password;
        machin.role = 1;
        machin.connected = true;

        /* Tentative de sauvegarde du nouvel utilisateur. */
        machin.save(function (err) {
          if (err)
            console.log("erreur enregistrement machin : " + err);
          else
          {
            title = "Bienvenue " + machin.firstName + " " + machin.lastName;
          }
        });
      }
      res.render('inscription.ejs', {title: title, helps: helps});
    }
});

app.get('/welcome', (req, res) => {
  res.render('welcome.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs', {title: "Connexion", erreurs: "Entrez votre email et votre mot de passe"});
});

app.get('/adminarticle', (req , res) => {
  res.render('adminarticle.ejs' , {title: "Ajouter un article" });
});

app.get('/article' , (req , res) => {
  res.render('article.ejs' , {title: "Articles"});
});
/* Post pour le login. */
app.post('/login', [
    /* Vérification email et mot de passer. */
    check('email').isEmail().withMessage('Doit être un email').trim().normalizeEmail(),
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

/* Page d'administration. */
app.get('/admin', function (req, res) {
    res.send('administration');
});

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
