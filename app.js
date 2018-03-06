const express = require('express')
const app = express()


const PORT = 3000;

app.get('/', (req, res)=> {
  res.render('index', {title: "Bonjour"});
});

/* Page de contact. */
app.get('/contact', function (req, res) {
  res.send('Contact');
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
