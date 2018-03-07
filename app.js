const express = require('express')
const app = express()
const PORT = 3000;
const session = require('express-session')
const {body, check, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')
app.set('views' , './views');
app.set('view engine' , 'ejs');





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

/* Post pour le login. */
app.post('/login', [
  /* Vérification email. */
  check('email').isEmail().withMessage('Doit être un email').trim().normalizeEmail(),
  check('password').isLength({min: 5})
], (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty())
  {
    res.render('login.ejs', {title: "Erreur", erreurs: erreurs.title});
  }
  else
  {
    res.render('login.ejs', {title: "Bon", erreurs: "Aucune erreur"});
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

/* Page erreur 404. */
app.get('/404', function (req, res) {
    res.send('erreur 404');
});

/* Articles. */
app.get('/article/:nom', function (req, res) {
    res.send(`article ${req.params.nom}`);
});

app.listen(PORT, ()=> {
    console.log(`Serveur lancé sur le port ${PORT}`);

});
