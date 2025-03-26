// models/cartera.js
const db = require('../config/db');

const correoUsuario = (id_venta) => {
    const query = `
        SELECT u.email, u.nombres, u.apellidos
        FROM Ventas v
        JOIN Usuarios u ON v.id_cliente = u.id_usuario
        WHERE v.id_venta = ?
    `;
    return db.execute(query, [id_venta]);
};

const productosVenta = (id_venta) => {
    const query = `
        SELECT p.nombre_producto, dv.cantidad, dv.subtotal, v.total
        FROM DetallesVentas dv
        JOIN Productos p ON dv.id_producto = p.id_producto
        JOIN Ventas v ON dv.id_venta = v.id_venta
        WHERE dv.id_venta = ?
    `;
    return db.execute(query, [id_venta]);
};

module.exports = { correoUsuario, productosVenta };
