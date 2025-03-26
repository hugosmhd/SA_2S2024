// services/carteraService.js
const carteraModel = require('../models/cartera');

const agregarCartera = async (id_cliente, monto) => {
    try {
        const result = await carteraModel.agregarCartera(id_cliente, monto);
        return result;
    } catch (error) {
        throw new Error('Error al agregar a la cartera: ' + error.message);
    }
};

const valorCartera = async (id_cliente) => {
    try {
        const result = await carteraModel.valorCartera(id_cliente);
        return result[0];
    } catch (error) {
        throw new Error('Error al devolver la cartera: ' + error.message);
    }
};

module.exports = { agregarCartera, valorCartera };
