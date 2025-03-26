const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cupon = sequelize.define('Cupon', {
    id_cupon: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo_cupon: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    descuento: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    fecha_vencimiento: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usos_totales: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usos_por_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('Activo', 'Inactivo'),
        defaultValue: 'Activo'
    }
}, {
    timestamps: false, // No usar `createdAt` ni `updatedAt`
    tableName: 'Cupones', // Especificamos el nombre correcto de la tabla
});

module.exports = Cupon;
