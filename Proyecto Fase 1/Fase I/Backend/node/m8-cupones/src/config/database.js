const { Sequelize } = require('sequelize');

// Conectar a la base de datos MySQL
const sequelize = new Sequelize('eCommerce', 'root', 'J)P%`>>`@`m0$LFv', {
    host: '35.184.59.66',
    dialect: 'mysql'
});

module.exports = sequelize;
