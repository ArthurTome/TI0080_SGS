// ---------------| LISTA DE PACOTES |-------------------
const createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
//const uuid = require(uuid).v4                 // GERA CARACTERES ALEATORIOS

//const { randomInt } = require('crypto');
//var logger = require('morgan');
//const handlebars = require('express-handlebars');

const PORTA = 3000                              // PORTA DO SERVICO

// ------------| CRIA APLICATIVO E CONFIGURA |-----------
const app = express();
app.set('view engine', 'hbs');

// DEFINE DIRETORIO DE ARQUIVOS ESTATICOS
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// --------------------| CRIA ROTAS |--------------------
app.get('/', (req, res) => {
    res.status(200).render('home');             // PROCURA ARQUIVO home.hbs
    var rand = Math.random()*1e16;
    console.log(rand);
})

app.get('/login', (req, res) => {
    res.status(200).render('login');            // PROCURA ARQUIVO login.hbs
})

app.get('/create', (req, res) => {
    res.status(200).render('create');           // PROCURA ARQUIVO create.hbs
})

app.get('/users', (req, res) => {
    res.status(200).render('users');            // PROCURA ARQUIVO users.hbs
})

app.get('*', function(req, res){
    res.status(404).send('what???');            // DEVOLVE ERRO SEM ROTA
});

// --------------------| FORMULARIOS |-------------------
app.post('/add_user', function(req, res){
    let user_name = req.body.name;
    let user_data = req.body.data;
    let user_addr = req.body.addr;
    let user_numb = req.body.numb;
    let user_phone = req.body.phone;
    let user_mail = req.body.mail;
    let user_type = req.body.user_type;
    let user_plan = req.body.user_plan;
    let user_pass = req.body.password;
    res.render('home')
})

app.post('/auth', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    console.log(username, password);
    if (username === 'admin' && password === 'admin') {

        res.status(201).render('users');        // LOGIN OK
    }
    else {
        res.status(401).send('Login failed');   // FALHA DE LOGIN
    }
})

// --------------------| FILE SYSTEM |-------------------
fs.readFile('./db/db.json', 'utf8', (err, file_user) =>{
    if(err) {
        console.error(err);
        return;
    }
    try {
        const data = JSON.parse(file_user);
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length-1; i++) {
            console.log(data[keys[i]][1]);      // DATA[CHAVE][LINHA]
        }
    } catch(err) {
        console.error(err)
    }
})

// --------------------| OUVE PORTA |--------------------
app.listen(PORTA, () => {
    // LOG
    console.log("Servidor rodando na porta: %d", PORTA);

});