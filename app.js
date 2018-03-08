const express = require('express')
const app = express()

// Générateur de faux contenu
const faker = require('faker');


const PORT = 3000;
const bodyParser = require('body-parser')
const session = require('express-session')
const {body, check, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')
const validator = require('express-validator')

// GESTION DE LA DB
const mongoose = require('mongoose');
mongoose.connect('mongodb://pandacious:gallad59282@ds261138.mlab.com:61138/mediatemplate');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connection : Impossible de se connecter à la base de donnée'));
db.once('open', ()=> {
  console.log('Vous êtes connecté à la base de données. GG.');
});

const articleSchema = mongoose.Schema({
  articletitle: String,
  articledate : Date,

});

const Article = mongoose.model('Article' , articleSchema );


// FIN DE LA GESTION DB


app.set('views' , './views');
app.set('view engine' , 'ejs');

app.use('/css' , express.static('assets/css'));
app.use('/js' , express.static('assets/js'));
app.use('/img' , express.static('assets/img'));
app.use(bodyParser.urlencoded({extended: false}));

// GESTION DES ARTICLES

app.post('/index' ,  (req , res) => {
  console.log('Image de l\'article :', req.body.articleimage);
  console.log('Le titre :',req.body.articletitle);
  console.log('Contenu :',req.body.articletext);
  console.log('La date :',req.body.articledate);
  console.log('L\'auteur :',req.body.authorarticle);
  res.sendStatus(201);
})




// FIN GESTION DES ARTICLES

app.get('/index', (req, res)=> {
res.render('index.ejs', {title: "Bonjour"});
});
// Page de contact
app.get('/contact', (req, res) => {
  res.render('contact.ejs', {title: "Contact"});
});
 app.get ('/inscription', (req, res)=> {
   res.render('inscription.ejs', {title: "Inscription"});
 });

app.get('/login', (req, res)=> {
  res.render('login.ejs', {title: "Connexion", erreurs: "Entrez votre email et votre mot de passe"});
});

app.get('/adminarticle', (req , res) => {
  res.render('adminarticle.ejs' , {title: "Ajouter un article" })
});
/* Post pour le login. */
app.post('/login', [
  /* Vérification email. */
  check('email').isEmail().withMessage('Doit être un email').trim().normalizeEmail(),
  check('password').isLength({min: 5}).withMessage('Le mot de passe doit avoir une longueur de 5 caractères au minimum')
], (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty())
  {
    res.render('login.ejs', {title: "Erreur", erreurs: erreurs.mapped()});
    console.log(erreurs.mapped());
  }
  else
  {
    res.render('index.ejs', {title: "Bon", erreurs: "Aucune erreur"});
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

/* Page erreur 404. */
app.use(function (req, res, next) {
  res.status(404).render('404.ejs', {title: "Page introuvable"});
});

app.listen(PORT, ()=> {
    console.log(`Serveur lancé sur le port ${PORT}`);

});
