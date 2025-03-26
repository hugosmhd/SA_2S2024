// services/carteraService.js
const notificacionModel = require('../models/notificacion');

const correoUsuario = async (id_venta) => {
    try {
        const result = await notificacionModel.correoUsuario(id_venta);

        return result[0][0];
    } catch (error) {
        throw new Error('Error al agregar a la cartera: ' + error.message);
    }
};

const productosVenta = async (id_venta) => {
    try {
        const result = await notificacionModel.productosVenta(id_venta);

        return result[0];
    } catch (error) {
        throw new Error('Error al agregar a la cartera: ' + error.message);
    }
};

module.exports = { correoUsuario, productosVenta };
