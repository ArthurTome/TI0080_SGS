/* 
  CRIAÇÃO DO MÓDULO SEQUELIZE
  QUE AJUDA NA CRIAÇÃO DE
  BANCO DE DADOS
*/


/*
sequelize.authenticate().then(function(){
    console.log('Connection established');
}).catch(function(err){
 console.log('Connection error' + err);
})
*/

const Users = sequelize.define('users', {
    nome: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
})


const Services = sequelize.define('services', {
    nome_service: {
        type: Sequelize.STRING
    },
    
})


//Services.sync({force: true});
