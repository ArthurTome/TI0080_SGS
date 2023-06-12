// Os users fulano e beltrano tem a senha 123456
// Cicrano3 1234Bb

// ---------------| LISTA DE PACOTES |-------------------
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

require('dotenv').config({path: __dirname + '/.env'});
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
app.use(cookieParser());

// LISTA DE TOLKENS INVALIDADOS
const blacklist = []

// -----------| MIDDLEWARE AND FUNCTIONS|----------------
var sha512 = (pwd, salt) => {
    // Gera um HMAC (Hash-based Message Authentication Code) 
    // usando a função de hash SHA512
    // a chave é passada em salt
    var hash = crypto.createHmac('sha512', salt)
    hash.update(pwd)
    return hash.digest('hex') 
}

// PUXA O TOKEN DO HEADER (TEM QUE CONFIGURAR NO JWT)
// AINDA ESTUDANDO COMO FUNCIONA
function verifyJWT(req, res, next) {
    const token = req.headers['x-access-token']

    // verifica se o token foi incluindo na blacklist devido a logout
    const index = blacklist.findIndex(item => item === token)
 
    if (index !== -1) {// está na blacklist!
        console.log('### 1 - está na blacklist')
        res.status(401).end('está na blacklist - fazer login novamente!') 
    } else {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                console.log('### 2 - erro na verificação')
                res.status(403).end('token inválido - fazer login novamente');
            } else {
                req.userid = decoded.userid;
                next();
            }
        })
    }
}

// CRIA USUARIO COM SENHA CONDIFICADA E INSERE NA BASE DE DADOS
// AINDA NÃO MODIFICADO
function create_user(userid, user, password) {

    var users = JSON.parse(fs.readFileSync(__dirname + '/db/cli.json'))

    for (var i in users) {
        if (users[i].userid == userid ||
            users[i].user == user) {
            console.log(`usuário ${user} e/ou id ${userid} já existem!  ITEM NAO CADASTRADO!`)
            return
        }
    }

    var pp = sha512(password, process.env.SECRET_USERS)

    users.push({
        "userid": userid,
        "user": user,
        "password": pp
    }) 
    
    //console.log(users)

    fs.writeFileSync(__dirname + '/db/cli.json',
        JSON.stringify(users, null, 2)
    )
}

// --------------------| CRIA ROTAS |--------------------
app.get('/', (req, res) => {
    res.status(200).render('home');             // PROCURA ARQUIVO home.hbs
})

app.get('/login', (req, res) => {
    res.status(200).render('login');            // PROCURA ARQUIVO login.hbs
})

app.get('/create', (req, res) => {
    res.status(200).render('create');           // PROCURA ARQUIVO create.hbs
})

app.get('/users', (req, res) => {
    console.log(req.cookies.user_token);

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

    // NÃO CONSTRUIDO
})

// GERA TOKEN DE LOGIN, REDIRECIONA PRA USERS
app.post('/auth', (req, res) => {
    var users = JSON.parse(fs.readFileSync(__dirname + '/db/cli.json'))
    let username = req.body.username;
    let password = sha512(req.body.password, process.env.SECRET_USERS)
    console.log(username, password);
    
    if (username && password) {                         // VERIFICA PREENCHIMENTO DOS CAMPOS
        var userloc = users.find((item) => {
            return (item.user == username && item.password == password)
        })
        console.log(userloc);
        if (userloc) {                                  // VERIFICA SE ESTA NA BASE DE CLIENTES
            var rand = Math.random()*1e16;
            //const token = jwt.sign(
            //    { userid: userloc.userid }, // payload (podem ser colocadas outras infos)
            //    process.env.SECRET, // chave definida em .env
            //    { expiresIn: 300 }  // em segundos
            //)
            //return res.json({ auth: true, token });
            res.cookie('user_token', rand, { expires: new Date(Date.now() + 900000)});
            
        }
        //if (username === 'admin' && password === 'admin') {
        //
        //    res.status(201).render('users');        // LOGIN OK
        //}
        res.status(200).redirect('users');
    }
    
    //res.status(401).end('Login failed');   // FALHA DE LOGIN
})

// --------------------| FILE SYSTEM |-------------------
/*
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
*/
// --------------------| OUVE PORTA |--------------------
app.listen(PORTA, () => {
    // LOG
    console.log("Servidor rodando na porta: %d", PORTA);
    //console.log(process.env) 

});