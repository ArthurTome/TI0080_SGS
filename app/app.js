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
//const uuid = require('uuid')                 // GERA CARACTERES ALEATORIOS

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

// --------------------| MIDLEWARE |---------------------


// --------------------| CRIA ROTAS |--------------------
app.get('/', async (req, res) => {
    // 1. BUSCA POR INFORMACOES PARA EXIBIR EM (NOTICES)
    var fecth_data = {  
        method:'POST',
        headers : { 'Content-Type': 'application/json' }
    };

    try { 
        const response = await fetch('http://localhost:4000/notices', fecth_data); 
        if (response.status === 200) { 
            const json = await response.json()
            console.log(json[0].notice);

            return res.status(200).render('home',
                                    {json: json[0]},
                                    );  // PROCURA ARQUIVO home.hbs
        } else { 
            throw "Deu erro!!" 
        } 
    } catch (ex) { 
        // PROCURA ARQUIVO login.hbs
        return res.status(404).send('NOT FOUND');
    }
})


//routa para login, chamada feita de forma 
//assincrona com fecth
app.get('/login', async(req, res) => {

    var user_token = req.cookies.user_token;

    let token_user = {  'user_token': user_token};
    var fecth_data = {  method:'POST',
                        body: JSON.stringify(token_user),
                        headers : { 'Content-Type': 'application/json' }
                        };
    try { 
        const response = await fetch('http://localhost:4000/token_verify', fecth_data); 
        if (response.status === 200) { 
            const json = await response.json()

            console.log(json);
            return res.status(200).redirect('/users');
        } else { 
            throw "Deu erro!!" 
        } 
    } catch (ex) { 
        // PROCURA ARQUIVO login.hbs
        return res.status(200).render('login');
    }
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

app.get('/users', async (req, res) => {
    // 1. VERIFICA TOKEN DE LOGIN EM (USER_SESSIONS)
    //  1.1 ERRO REDIRECIONA 'LOGIN'
    //  1.2 PROXIMO
    // 2. RESGATA DADOS DO USUARIO (USER_INFO) & (USER_EXANS)
    // 3. REDERIZA A PAGINA USANDO DADOS DE USUARIO
    
    var user_token = req.cookies.user_token;

    let token_user = {  'user_token': user_token};
    var fecth_data = {  method:'POST',
                        body: JSON.stringify(token_user),
                        headers : { 'Content-Type': 'application/json' }
                        };

    try { 
        const response = await fetch('http://localhost:4000/token_verify', fecth_data); 
        if (response.status === 200) { 
            const json = await response.json()

            if (json.user_type == "0"){            // USUARIO ADMINISTRATIVO
                return res.status(200).render('admin',
                {json: json});
            }
            if (json.user_type == "1"){            // USUARIO ADMINISTRATIVO
                return res.status(200).render('users',
                {json: json});
            }
            if (json.user_type == "2"){            // USUARIO MEDICO
                return res.status(200).render('doctor',
                {json: json});
            }

        } else { 
            throw "Deu erro!!" 
        } 
    } catch (ex) { 
        return res.status(401).send('novo login');
    }
    res.status(500).send({ err: 'Erro aqui!' }) 

                 // ROTA PADRÃO
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

    var user_token = req.cookies.user_token;

    let token_user = {  'user_token': user_token};
    var fecth_data = {  method:'POST',
                        body: JSON.stringify(token_user),
                        headers : { 'Content-Type': 'application/json' }
                        };
    try { 
        const response = await fetch('http://localhost:4000/token_verify', fecth_data); 
        if (response.status === 200) { 
        const json = await response.json()

        if (json.user_type == "0"){
            let user_login = req.body.login;
            let user_name = req.body.user_name;
            let user_data = req.body.data;
            let user_addr = req.body.addr;
            let user_numb = req.body.numb;
            let user_phone = req.body.phone;
            let user_mail = req.body.mail;
            let user_type = req.body.user_type;
            let user_cpf = req.body.user_cpf;
            let user_pass = sha512(req.body.password, process.env.SECRET_USERS);
        
            let dados = { 
                 'user_login': user_login,'user_name': user_name,
                 'user_data': user_data, 'user_cpf': user_cpf,
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
                return res.status(200).redirect('/users');
            } catch (ex) { 
                return res.status(500).send({ erro: 'deu erro!!' }) 
            }    
            }
        } else { 
            throw "Deu erro!!" 
        } 
    } catch (ex) { 
        // PROCURA ARQUIVO login.hbs
        return res.status(401).send('Não autorizado');
    }

});


//Routa para adiciona consulta atraves 
// de chamada assinc
app.post('/add_consulta', async (req, res) => {
    let id = req.body.id;
    let cons_data = req.body.data_consulta;
    let name_pacient = req.body.paciente;
    let cons_local = req.body.local_consulta;
    let cons_medico = req.body.medico;
    let dados = { 
         'id': id,
         'cons_data': cons_data, 'name_pacient': name_pacient,
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
    let id = req.body.id;
    let date_exam = req.body.data_exame;
    let descrip_exam = req.body.descricao_exame;
    let local_exam = req.body.local_do_exame;
    let name_pacient = req.body.nome_paciente;
    let dados = { 
         'id': id, 
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
    let username = req.body.username;
    let password = sha512(req.body.password, process.env.SECRET_USERS);

    let user_data = {   'username': username, 
                        'password': password};

    var login_data = {  method:'POST',
                    body: JSON.stringify(user_data),
                    headers : { 'Content-Type': 'application/json' }
                };
    try { 
        const response = await fetch('http://localhost:4000/user_login', login_data); 
        if (response.status === 200) {

            let token_user = {   'username': username};
            var token_data = {  method:'POST',
                            body: JSON.stringify(token_user),
                            headers : { 'Content-Type': 'application/json' }
                        };
            try { 
                const response = await fetch('http://localhost:4000/user_token', token_data); 
                if (response.status === 200) { 
                    var json = await response.json();
                    console.log('ate aqui ok');
                    var session_token = json.session_token;
                    res.cookie('user_token', session_token, { expires: new Date(Date.now() + 900000)});
                    return res.status(200).redirect('/users');
                } 
                else { 
                    throw "Deu erro!!" 
                } 
            } catch (ex) {
                return res.status(401).send('Falha token');   // FALHA DE LOGIN 
            }
        } 
        else { 
            throw "Deu erro!!" 
        } 
    } catch (ex) {
        return res.status(401).send('Email ou Senha Incorretos');   // FALHA DE LOGIN 
    } 

    res.status(500).send('Erro Interno');   // FALHA DE LOGIN
})

// --------------------| FILE SYSTEM |-------------------
app.get('/', function(req, res, next) {
    res.render('form', { title: 'Express' });
  });
  
app.get('/consultas', function(req, res, next) {
    res.render('consultas');
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

// é necessário passar uma chave como parâmetro
app.get('/select_cons', async function (req, res, next) { 
    try { 
        const response = await fetch('http://localhost:4000/selectCons/'); 
        if (response.status === 200) { 
            const json = await response.json()
            var cons = json.find(consulta => consulta.cons_medico === json.cons_medico);
            res.render('consultas', { consultas: cons }) 
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
    console.log("SERVIDOR DE ESTATICOS: %d", PORTA);
});