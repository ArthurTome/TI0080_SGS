/* 
  CRIAÇÃO DO MÓDULO SEQUELIZE
  QUE AJUDA NA CRIAÇÃO DE
  BANCO DE DADOS
*/

const Sequelize = require('sequelize');
const sequelize = new Sequelize("sequelize", 'root', 'Bia220614', {
    host: 'localhost',
    dialect: 'mysql'
});

/*
sequelize.authenticate().then(function(){
    console.log('Connection established');
}).catch(function(err){
 console.log('Connection error' + err);
})
*/

const users = sequelize.define('users', {
    nome: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    }
});

const services = sequelize.define('services', {
    nome_service: {
        type: Sequelize.STRING
    },
    
});

//services.sync({force: true})