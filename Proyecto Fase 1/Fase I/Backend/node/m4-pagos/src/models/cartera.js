// models/cartera.js
const db = require('../config/db');

const agregarCartera = (id_cliente, monto) => {
    const query = `
        UPDATE Usuarios SET cartera = cartera + ? WHERE id_usuario = ?
    `;
    return db.execute(query, [monto, id_cliente]);
};

const valorCartera = (id_cliente) => {
    const query = `
        SELECT cartera FROM Usuarios WHERE id_usuario = ?
    `;
    return db.execute(query, [id_cliente]);
};


module.exports = { agregarCartera, valorCartera };
