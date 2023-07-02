var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', async function(req, res, next) {
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

module.exports = router;