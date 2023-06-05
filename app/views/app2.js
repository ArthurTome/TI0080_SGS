const express = require("express");
const handlebars = require('express-handlebars');
const bodyParser = require("body-parser");
const User = require(".src/models/User");
const app = express();

// config
// Template Engine
    app.engine("handlebars", handlebars({
        defaultLayout: 'main',
    }))

    app.set('view engine', 'handlebars');

// configura o body-parser
// que é necessário para obter as 
// respostas dos html
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

// rotas
// rota inicial  
app.get('/', (req, res) => {
    res.render('home');
});

//rota para login
app.post('/login', (req, res) => {
    User.create({

    }).then(() => {
        res.send("User created")
    }).catch(err => {
        res.send("User not created" + err)
    });
    res.render('singin');
});


//criar, e colocar para 
// escutar o server
// deve ser a ult instrução
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
  });
  