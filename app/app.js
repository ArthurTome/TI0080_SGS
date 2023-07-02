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


//routa para login, chamada feita de forma 
//assincrona com fecth
app.get('/login', async (req, res) => {

    try { 
        const response = await fetch('http://localhost:4000/selectUser/'); 
        if (response.status === 200) { 
            const json = await response.json()
            let username = json.username; 
            let password = json.password;
            let dados = {'username': username,
                  'password': password
                }
            res.render('login', { dados: dados }) 
        } else { 
            throw "Deu erro!!" 
        } 
    } catch (ex) { 
        res.status(500).send({ err: 'deu erro!!' }) 
    } 
          // PROCURA ARQUIVO login.hbs
})

app.get('/create_user', (req, res) => {
    res.status(200).render('create_user');           // PROCURA ARQUIVO create.hbs
})

app.get('/create_exam', (req, res) => {
    res.status(200).render('create_Exam');           // PROCURA ARQUIVO create.hbs
})

app.get('/create_cons', (req, res) => {
    res.status(200).render('create_consulta');           // PROCURA ARQUIVO create.hbs
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
// Está correta - faz a chamada assíncrona 
// E salvar os dados do usuário correctamente
app.post('/add_user', async (req, res) => {
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
    let dados = { 
         'user_name': user_name,
         'user_data': user_data, 'user_plan': user_plan,
         'user_pass': user_pass, 'user_type': user_type, 
         'user_phone': user_phone, 'user_mail': user_mail, 
         'user_numb': user_numb, 'user_addr': user_addr        
        }
    
        try {
        await fetch('http://localhost:4000/insertUser/',
         {
            method:'POST',
            body: JSON.stringify(dados),
            headers : { 'Content-Type': 'application/json' },
    
            })
            res.redirect('/')
          } catch (ex) { 
            res.status(500).send({ erro: 'deu erro!!' }) 
        }    

});


//Routa para adiciona consulta atraves 
// de chamada assinc
app.post('/add_consulta', async (req, res) => {

    let cons_data = req.body.data_consulta;
    let name_pacient = req.body.paciente;
    let cons_local = req.body.local_consulta;
    let cons_medico = req.body.medico;
    let dados = { 'user_name': user_name,
         'user_data': cons_data, 'name_pacient': name_pacient,
         'cons_local': cons_local, 'cons_medico': cons_medico, 
        }
    
        try {
        await fetch('http://localhost:4000/insertCons/',
         {
            method:'POST',
            body: JSON.stringify(dados),
            headers : { 'Content-Type': 'application/json' },
    
            })
            res.redirect('/')
          } catch (ex) { 
            res.status(500).send({ erro: 'deu erro!!' }) 
        }    
    
});

//route para adicionar exames
//chamada assinc
app.post('/add_exam', async (req, res) => {

    let date_exam = req.body.data_exame;
    let descrip_exam = req.body.descricao_exame;
    let local_exam = req.body.local_do_exame;
    let name_pacient = req.body.nome_paciente;
    let dados = { 
         'date_exam': date_exam, 'name_pacient': name_pacient,
         'descrip_exam': descrip_exam, 'local_exam': local_exam, 
        }
    
        try {
        await fetch('http://localhost:4000/insertExam/',
         {
            method:'POST',
            body: JSON.stringify(dados),
            headers : { 'Content-Type': 'application/json' },
    
            })
            res.redirect('/')
          } catch (ex) { 
            res.status(500).send({ erro: 'deu erro!!' }) 
        }    
    
});

app.post('/auth', async (req, res) => {
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
    try { 
        const response = await fetch('http://localhost:4000/selectUser/'); 
        if (response.status === 200) { 
            var json = await response.json()
        } else { 
            throw "Deu erro!!" 
        } 
    } catch (ex) { 
        res.status(500).send({ err: 'deu erro!!' }) 
    } 
    let username = json.username;
    let password = sha512(json.password, process.env.SECRET_USERS);
    //let username = req.body.username;
    //let password = sha512(req.body.password, process.env.SECRET_USERS);

    userloc = login(username, password);

    if (userloc) {                                  // VERIFICA SE ESTA NA BASE DE CLIENTES
        var session_token = token_modify(username);
        res.cookie('user_token', session_token, { expires: new Date(Date.now() + 900000)});  // 15 MIN
        return res.status(200).redirect('users');   // ENCERRA CAMINHO (SEM ERRO DE REENVIO)
    }
    
    res.status(401).send('Email ou Senha Incorretos');   // FALHA DE LOGIN
})

// --------------------| FILE SYSTEM |-------------------
app.get('/', function(req, res, next) {
    res.render('form', { title: 'Express' });
  });
  
/* routa para selecionar todos os usuários
que estão no arquivo json*/
app.get('/select_users', async function (req, res, next) { 
    try { 
        const response = await fetch('http://localhost:4000/selectUser/'); 
        if (response.status === 200) { 
            const json = await response.json()
            
            res.render('listUser', { dados: json }) 
        } else { 
            throw "Deu erro!!" 
        } 
    } catch (ex) { 
        res.status(500).send({ err: 'deu erro!!' }) 
    } 
})

/* um modelo para inserir novos dados no json
de forma assinc */
app.post('/', async function(req, res, next) {
    let username = req.body.username; 
    let email = req.body.email;
    let id = req.body.id;
    let dados = { 'username': username, 'email': email, 'id': id };

    try {
    await fetch('http://localhost:4000/insertUser/',
     {
        method:'POST',
        body: JSON.stringify(dados),
        headers : { 'Content-Type': 'application/json' },

        })
        res.redirect('/select')
      } catch (ex) { 
        res.status(500).send({ erro: 'deu erro!!' }) 
    }       
});



// --------------------| OUVE PORTA |--------------------
app.listen(PORTA, () => {
    // LOG
    console.log("Servidor rodando na porta: %d", PORTA);
});