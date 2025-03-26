// services/tarjetaService.js
const tarjetaModel = require('../models/tarjeta');

const agregarTarjeta = async (id_cliente, numero_tarjeta, fecha_vencimiento, cvc) => {
    try {
        const result = await tarjetaModel.agregarTarjeta(id_cliente, numero_tarjeta, fecha_vencimiento, cvc);
        return result;
    } catch (error) {
        throw new Error('Error al agregar la tarjeta: ' + error.message);
    }
};

const eliminarTarjeta = async (id_tarjeta) => {
    try {
        const result = await tarjetaModel.eliminarTarjeta(id_tarjeta);
        return result;
    } catch (error) {
        throw new Error('Error al eliminar la tarjeta: ' + error.message);
    }
};

const clienteTarjetas = async (id_tarjeta) => {
    try {
        const result = await tarjetaModel.clienteTarjetas(id_tarjeta);
        return result[0];
    } catch (error) {
        throw new Error('Error al buscar tarjetas: ' + error.message);
    }
};

module.exports = { agregarTarjeta, eliminarTarjeta, clienteTarjetas };
