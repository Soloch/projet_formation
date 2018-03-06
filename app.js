const express = require('express')
const app = express()

const PORT = 3000;


<<<<<<< HEAD
app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(PORT, function(){
  console.log(`listening on port ${PORT}`);
=======
const PORT = 3000;

app.get('/', (req, res)=> {
  res.send('Hello World');
});

app.listen(PORT, ()=> {
  console.log(`Serveur lancé sur le port ${PORT}`);
>>>>>>> 0a413ef64aa51dc405046a8a0310f8c06ddabca0
});
