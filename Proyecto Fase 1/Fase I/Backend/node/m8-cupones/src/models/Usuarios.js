const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de que esté correctamente configurada tu conexión a la base de datos

const Usuarios = sequelize.define('Usuarios', {
    id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tipo_usuario: {
        type: DataTypes.ENUM('Proveedor', 'Cliente'),
        allowNull: false,
    },
    nombre_empresa: {
        type: DataTypes.STRING(100),
        allowNull: true,  // Puede ser NULL si el tipo de usuario es 'Cliente'
    },
    nombres: {
        type: DataTypes.STRING(100),
        allowNull: true,  // Solo se aplica a usuarios del tipo 'Cliente'
    },
    apellidos: {
        type: DataTypes.STRING(100),
        allowNull: true,  // Solo se aplica a usuarios del tipo 'Cliente'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // El email debe ser único
    },
    contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    celular: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    fotografia: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    cartera: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0, // El valor por defecto es 0
    }
}, {
    timestamps: false,  // No se generarán las columnas createdAt y updatedAt
    tableName: 'Usuarios', // Nombre de la tabla en la base de datos
});

module.exports = Usuarios;
