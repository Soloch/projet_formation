var express = require('express')
var app = express()

const PORT = 3000;

app.get('/', (req, res)=> {
  res.send('Hello World');
});

app.listen(PORT, ()=> {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
