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
const uuid = require('uuid')                 // GERA CARACTERES ALEATORIOS

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

// FUNÇÃO DO LADO DO BANCO DE DADOS
function login(username, password) {
    var users = JSON.parse(fs.readFileSync(__dirname + '/db/cli.json'))
    var userloc = users.find((item) => {            // BUSCA NO BANCO DE DADOS
        return ((item.user == username)&&(item.password == password))
    })

    if (userloc){
        return true;
    }
    return false;
}

// VERIFICA TOKEN NO BANCO DE DADOS
function token_verify(req, res, next) {
    var session = JSON.parse(fs.readFileSync(__dirname + '/db/session.json'))  // db de token
    var user_check = session.findIndex((item) => {
        return (item.sesion_token == req.cookies.user_token)
    })
    if (user_check == -1) {                                 // SEM TOKEN ASSOCIADO - > NOVO LOGIN
        return res.status(401).redirect('login')
    }
    next();
}

function token_consut(token) {
    var session = JSON.parse(fs.readFileSync(__dirname + '/db/session.json'))  // db de token
    var user = session.find((item) => {
        return (item.sesion_token == token)
    })

    return user.user
}

// CRIA OU MODIFICA TOKEN NO BANCO DE DADOS
function token_modify(user) {
    var sesion_token;
    var session = JSON.parse(fs.readFileSync(__dirname + '/db/session.json'));
    var user_check = session.findIndex((item) => {
        return (item.user == user)
    })

    console.log(user_check)
    if (user_check == -1){                               // USUARIO NÃO EXISTE
        do{
            sesion_token = uuid.v4();
            var session_check = session.findIndex((item) => {
                return (item.sesion_token == sesion_token)
            })
        }while(session_check != -1);
        
        session.push({
            "user": user,
            "sesion_token": sesion_token
        }) 
        fs.writeFileSync(__dirname + '/db/session.json',
            JSON.stringify(session, null, 2)
        )
    } else {                                            // USUARIO JA EXISTE
        do{
            sesion_token = uuid.v4();
            var session_check = session.findIndex((item) => {
                return (item.sesion_token == sesion_token)
            })
        }while(session_check != -1);

        session[user_check].sesion_token = sesion_token;

        fs.writeFileSync(__dirname + '/db/session.json',
        JSON.stringify(session, null, 2)
        )
    }

    return sesion_token;
}

function userdata(user){
    var users_data = JSON.parse(fs.readFileSync(__dirname + '/db/cli_data.json'))
    var data = users_data.find((item) => {            // BUSCA NO BANCO DE DADOS
        return (item.user == user)
    })
    return data;
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
    // 1. BUSCA POR INFORMACOES PARA EXIBIR EM (NOTICES)
    res.status(200).render('home');             // PROCURA ARQUIVO home.hbs
})

app.get('/login', (req, res) => {
    res.status(200).render('login');            // PROCURA ARQUIVO login.hbs
})

app.get('/create', (req, res) => {
    res.status(200).render('create');           // PROCURA ARQUIVO create.hbs
})

app.get('/users', token_verify, (req, res) => {
    // 1. VERIFICA TOKEN DE LOGIN EM (USER_SESSIONS)
    //  1.1 ERRO REDIRECIONA 'LOGIN'
    //  1.2 PROXIMO
    // 2. RESGATA DADOS DO USUARIO (USER_INFO) & (USER_EXANS)
    // 3. REDERIZA A PAGINA USANDO DADOS DE USUARIO
    var user = token_consut(req.cookies.user_token);
    var user_data = userdata(user);

    if (user_data.user_type == "0"){            // USUARIO ADMINISTRATIVO
        return res.status(200).render('admin', {user: user_data});
    }
    if (user_data.user_type == "1"){            // USUARIO ADMINISTRATIVO
        return res.status(200).render('users', {user: user_data});
    }
    

    console.log(user_data);

    res.status(200).render('users', {user: user_data});
    //res.status(401).send('Expirado por favor realize novo login');
})

app.get('*', (req, res) => {
    res.status(404).send('what???');            // DEVOLVE ERRO SEM ROTA
});

// --------------------| FORMULARIOS |-------------------
app.post('/add_user', (req, res) => {
    // 1. BUSCA SE O USUARIO ESTA CADASTRADO
    //  1.1 ERRO USUARIO JA TEM CONTA
    //  1.2 PROXIMO
    // 2. CADASTRA USUARIO NAS BASES (USERS) (USERS_INFO)
    // 3. REDIRECIONA PARA 'USERS'

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

app.post('/auth', (req, res) => {
    // 1. VERIFICA TOKEN DE LOGIN
    //  1.1 TOKEN VALIDO -> CONSULTA (TIPO) -> REDIRECIONA 'USERS'
    //  1.2 TOKEN INVALIDO -> REMOVE ENTRADA DE SESSION -> PROXIMO
    //  1.3 SEM TOKEN -> PROXIMO
    // 2. RECEBE OS DADOS DE LOGIN
    //  2.1 ERRO LOGIN OU SENHA
    //  2.2 PROXIMO
    // 3. GERA TOKEN DE LOGIN
    //  3.1 ERRO TOKEN EM USO -> REPETE 3
    //  3.2 PROXIMO
    // 4. INSERE USUARIO E TOKEN EM (USER_SESSIONS)
    // 5. INSERE NO COOKIE O TOKEN
    // 6. REDIRECIONA PRA USERS

    let username = req.body.username;
    let password = sha512(req.body.password, process.env.SECRET_USERS);

    userloc = login(username, password);

    if (userloc) {                                  // VERIFICA SE ESTA NA BASE DE CLIENTES
        var session_token = token_modify(username);
        res.cookie('user_token', session_token, { expires: new Date(Date.now() + 900000)});  // 15 MIN
        return res.status(200).redirect('users');   // ENCERRA CAMINHO (SEM ERRO DE REENVIO)
    }
    
    res.status(401).send('Email ou Senha Incorretos');   // FALHA DE LOGIN
})

// --------------------| FILE SYSTEM |-------------------


// --------------------| OUVE PORTA |--------------------
app.listen(PORTA, () => {
    // LOG
    console.log("Servidor rodando na porta: %d", PORTA);
});