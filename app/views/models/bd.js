const Sequelize = require('sequelize');
const sequelize = new Sequelize("usuario_app",
        'root', 'Bia220614', 
        {
        host: 'localhost',
        dialect: 'mysql'
        }
        );

module.exports = {
            Sequelize: Sequelize,
            sequelize: sequelize
}