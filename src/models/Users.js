const db = require('./bd');

const User = db.sequelize.define(
    'usuario_app', {
        name: {
            type: db.Sequelize.STRING

        },
        email: {
            type: db.Sequelize.STRING
        },
        tipo: {
            type: db.Sequelize.STRING
        }
    }
);

//Users.sync({force: true});

module.exports = User