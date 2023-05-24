const express = require("express");
const handlebars = require('express-handlebars');
const Sequelize = require('sequelize');
const app = express();

// config
// Template Engine
app.engine("handlebars", handlebars({
    defaultLayout: 'main',
}))
app.set('view engine', 'handlebars');

    const sequelize = new Sequelize("sequelize",
        'root', 'Bia220614', 
        {
        host: 'localhost',
        dialect: 'mysql'
        }
        );

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('singin');
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
  });
  