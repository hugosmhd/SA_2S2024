const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de tener la configuración de Sequelize correcta
const Usuarios = require('./Usuarios'); // Importar el modelo Usuarios
const Cupon = require('./Cupon'); // Importar el modelo Cupon

const UsosCupones = sequelize.define('UsosCupones', {
    id_uso: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuarios,
            key: 'id_usuario', // La clave primaria de la tabla Usuarios
        },
        onDelete: 'CASCADE', // Si el usuario se elimina, también se eliminarán los usos de cupones
    },
    id_cupon: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cupon,
            key: 'id_cupon', // La clave primaria de la tabla Cupon
        },
        onDelete: 'CASCADE', // Si el cupón se elimina, también se eliminarán los registros de UsosCupones
    },
    fecha_uso: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // El valor por defecto es la fecha y hora actual
        allowNull: false,
    }
}, {
    timestamps: false, // No usamos createdAt y updatedAt
    tableName: 'UsosCupones', // El nombre de la tabla en la base de datos
});

module.exports = UsosCupones;
