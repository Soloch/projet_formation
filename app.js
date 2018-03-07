const express = require('express')
const app = express()
const PORT = 3000;
app.set('views' , './views');
app.set('view engine' , 'ejs');

app.use('/css' , express.static('assets/css'));
app.use('/js' , express.static('assets/js'));



app.get('/', (req, res)=> {
res.render('index.ejs', {title: "Bonjour"});
});
// Page de contact
app.get('/contact' , (req , res) => {
  res.render('contact.ejs' , {title: "Contact"});
});
 app.get ('/inscription' , (req , res)=> {
   res.render('inscription.ejs' , {title: "Inscription"});
 });

app.get('/login' , (req , res)=> {
  res.render('login.ejs' , {title: "Connexion"});
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
