// models/tarjeta.js
const db = require('../config/db');

const agregarTarjeta = (id_cliente, numero_tarjeta, fecha_vencimiento, cvc) => {
    const query = `
        INSERT INTO TarjetasPago (id_cliente, numero_tarjeta, fecha_vencimiento, cvc)
        VALUES (?, ?, ?, ?)
    `;
    return db.execute(query, [id_cliente, numero_tarjeta, fecha_vencimiento, cvc]);
};

const eliminarTarjeta = (id_tarjeta) => {
    const query = `
        DELETE FROM TarjetasPago WHERE id_tarjeta = ?
    `;
    return db.execute(query, [id_tarjeta]);
};

const clienteTarjetas = (id_cliente) => {
    const query = `
        SELECT * FROM TarjetasPago WHERE id_cliente = ?
    `;
    return db.execute(query, [id_cliente]);
};

module.exports = { agregarTarjeta, eliminarTarjeta, clienteTarjetas };
