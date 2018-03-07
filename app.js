const express = require('express')
const app = express()
const PORT = 3000;
const bodyParser = require('body-parser')
const session = require('express-session')
const {body, check, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')
const validator = require('express-validator')
app.set('views' , './views');
app.set('view engine' , 'ejs');

app.use('/css' , express.static('assets/css'));
app.use('/js' , express.static('assets/js'));
app.use(bodyParser.urlencoded({extended: false}));


app.get('/', (req, res)=> {
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
  check('password').isLength({min: 5}).withMessage('Le mot de passe doit avoir une longueur de 5 caractères au minimum')
], (req, res/*, next*/) => {
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
