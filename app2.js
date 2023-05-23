const express = require("express");

const app = express();

app.get('/', function(req, res){
    res.sendFile(__dirname + "/views/index.html")
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/singin.html')
});

app.get('/cadastrar', (req, res) => {
    res.sendFile(__dirname + '/views/singup.html')
});

app.listen(8080);