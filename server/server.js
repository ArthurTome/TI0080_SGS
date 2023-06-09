//
//  SERVIDOR DE DADOS DA APLICAÇÃO
//
//

const PORTA = 4000;  // PORTA DO SERVICO

// ----------------| PACOTES UTILIZADOS |----------------
const createError = require('http-errors');
const express = require('express');
const bodyParser = require("body-parser");
var fs = require('fs');
const path = require('path')
const uuid = require('uuid')                 // GERA CARACTERES ALEATORIOS

// -----------------| CRIA E CONFIGURA |-----------------
const app = express();
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// ----------------------| ROTAS |-----------------------
// ROTA DE TESTE
app.post('/', (req, res) => {
    console.log(req.query.var);
    res.status(200).end();
})

app.get('/home', (req, res) => {
    res.render('index');
})

app.post('/notices', (req, res) => {
  var notices = JSON.parse(fs.readFileSync(__dirname + '/db/notices.json'));
  console.log([notices.at(-1), notices.at(-2)]);
  //res.status(200);
  return res.status(200).end(JSON.stringify(notices));
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
    //console.log(user_token);
    var token_check = session.findIndex((item) => {
        return (item.sesion_token == user_token)
    })


    if(token_check != -1){
        var user_check = user_data.findIndex((item) => {
            return (item.user == session[token_check].user);
        })
        //console.log(user_data[user_check]);
        return res.status(200).end(JSON.stringify(user_data[user_check]));
    }

    return res.status(401).send('Usuario não identificado');
})


//rota para selecionar os dados de usuarios
app.get('/selectUser', (req, res) => {
        
    // Lendo o conteúdo do arquivo user.json
    const json = fs.readFileSync(__dirname + '/public/user.json')
    const users = JSON.parse(json)
    
    res.json(users)

   });
   

//rota para selecionar os dados de exames
app.get('/selectExam', (req, res) => {
    // Lendo o conteúdo do arquivo user.json
    const json = fs.readFileSync(__dirname + '/public/exam.json')
    const exams = JSON.parse(json)
    res.json(exams)

   });

app.get('/selectCons', (req, res) => {
    // Lendo o conteúdo do arquivo user.json
    const json = fs.readFileSync(__dirname + '/public/consulta.json')
    const consultas = JSON.parse(json)
    res.json(consultas)

   });

   

app.post('/insertUser', (req, res) => {
    //var users = JSON.parse(fs.readFileSync(__dirname + '/public/user.json'));
    var cli_data = JSON.parse(fs.readFileSync(__dirname + '/db/cli_data.json'));
    var cli = JSON.parse(fs.readFileSync(__dirname + '/db/cli.json'));

    var user_data = {
      "user": req.body.user_login,
      "user_name": req.body.user_name,
      "user_data": req.body.user_data,
      "user_aborh": "o+",
      "user_addr": req.body.user_addr,
      "user_numb": req.body.user_numb,
      "user_phone": req.body.user_phone,
      "user_mail": req.body.user_mail,
      "user_cpf": req.body.user_cpf,
      "user_rel": "solteiro",
      "user_type": req.body.user_type,
      "user_plan": "default"
    }

    var user = {
      "user": req.body.user_login,
      "password": req.body.user_pass
    }

    cli_data.push(user_data);
    cli.push(user);
    
    fs.writeFileSync(__dirname + '/db/cli_data.json', JSON.stringify(cli_data, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      } else {
        console.log('Data successfully written to cli_data.json');
      }
    });

    fs.writeFileSync(__dirname + '/db/cli.json', JSON.stringify(cli, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      } else {
        console.log('Data successfully written to cli.json');
      }
    });

    res.sendStatus(200);
  });

  
app.post('/insertExam', (req, res) => {
    var dados = req.body;
  
    var exams = JSON.parse(fs.readFileSync(__dirname + '/public/exam.json'));
    
    exams.push(dados);
    
    fs.writeFile(__dirname + '/public/exam.json', JSON.stringify(exams), (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        console.log('Data successfully written to exam.json');
        res.sendStatus(200);
      }
    });
  });

app.post('/insertCons', (req, res) => {
    var dados = req.body;
  
    var consultas = JSON.parse(fs.readFileSync(__dirname + '/public/consulta.json'));
    
    consultas.push(dados);
    
    fs.writeFile(__dirname + '/public/consulta.json', JSON.stringify(consultas), (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        console.log('Data successfully written to consultas.json');
        res.sendStatus(200);
      }
    });
  });
  

// --------------------| OUVE PORTA |--------------------
app.listen(PORTA, () => {
    // LOG
    console.log("SERVIDOR DE DADOS PORTA: %d", PORTA);
});