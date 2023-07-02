//
//  SERVIDOR DE DADOS DA APLICAÇÃO
//
//

const PORTA = 4000;  // PORTA DO SERVICO

// ----------------| PACOTES UTILIZADOS |----------------
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const fs = require('fs');

const uuid = require('uuid')                 // GERA CARACTERES ALEATORIOS

// -----------------| CRIA E CONFIGURA |-----------------
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// ----------------------| ROTAS |-----------------------
// ROTA DE TESTE
app.post('/', (req, res) => {
    console.log(req.query.var);
    res.status(200).end();
})

// RECEBE OS DADOS DE LOGIN E EMITE UMA AUTORIZAÇÃO
app.post('/user_login', (req, res) => {
    // Lendo o conteúdo do arquivo user.json

    let username = req.body.username;
    let password = req.body.password;

    var users = JSON.parse(fs.readFileSync(__dirname + '/db/cli.json'));
    var userloc = users.find((item) => {            // BUSCA NO BANCO DE DADOS
        return ((item.user == username)&&(item.password == password));
    })

    if (userloc){
        console.log('Ok');
        return res.status(200).send('login ok');
    }
    return res.status(401).send('Não autorizado');
    //
    //const json = fs.readFileSync(path.join(path.resolve(__dirname,"../public"),'user.json'))
    //const users = JSON.parse(json)
    //res.json(users)
});

// RECEBE O NOME DO USUARIO E EMITE UM TOKEN
app.post('/user_token', (req, res) => {
    let username = req.body.username;
    var sesion_token;
    var session = JSON.parse(fs.readFileSync(__dirname + '/db/session.json'));
    var user_check = session.findIndex((item) => {
        return (item.user == username)
    })

    console.log(username)
    if (user_check == -1){                               // USUARIO NÃO EXISTE
        do{
            sesion_token = uuid.v4();
            var session_check = session.findIndex((item) => {
                return (item.sesion_token == sesion_token)
            })
        }while(session_check != -1);
        
        session.push({
            "user": username,
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
    let token_user = {"session_token": sesion_token};

    return res.status(200).end(JSON.stringify(token_user))

})

// RECEBE UM TOKEN E RETORNA OS DADOS DO RESPECTIVO USUARIO
app.post('/token_verify', (req, res) => {
    let user_token = req.body.user_token;
    var session = JSON.parse(fs.readFileSync(__dirname + '/db/session.json'))  // db de token
    var user_data = JSON.parse(fs.readFileSync(__dirname + '/db/cli_data.json'))  // db de token
    
    var token_check = session.findIndex((item) => {
        return (item.sesion_token == user_token)
    })


    if(token_check != -1){
        var user_check = user_data.findIndex((item) => {
            return (item.user == session[token_check].user)
        })

        return res.status(200).end(JSON.stringify(user_data[user_check]));
    }

    return res.status(401).send('Usuario não identificado');
})

// --------------------| OUVE PORTA |--------------------
app.listen(PORTA, () => {
    // LOG
    console.log("SERVIDOR DE DADOS PORTA: %d", PORTA);
});