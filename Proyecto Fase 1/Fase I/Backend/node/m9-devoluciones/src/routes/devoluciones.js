const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const app = express.Router();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ', err);
    process.exit(1);
  }
  console.log('Conectado a la base de datos MySQL');
});

const SECRET_KEY = '11a23498c20ce53963c1b69d288c4e3244736c2e20b5ac458dddd318162c00d5'; 

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Verificar el token
        const datos = JSON.parse(decoded.sub)
        const sub = {
            sub: {
                id: datos.id
            }
        }
        
        req.user = sub; // Guardar los datos decodificados en req.user
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

app.post('/devoluciones', verifyToken, (req, res) => {
  const { id_venta, productos } = req.body; // Productos será un arreglo con id_producto y cantidad
  const id_cliente = req.user.sub.id;
  // Calcular el monto total a devolver
  let monto_a_devolver = 0;
  let detallesDevolucion = [];

  // Primero, obtener el descuento de la venta
  db.query('SELECT descuento FROM Ventas WHERE id_venta = ?', [id_venta], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    const descuento = result[0] ? result[0].descuento : 0; // Si no hay descuento, tomamos 0

    productos.forEach((producto) => {
      const { id_producto, cantidad } = producto;
      console.log(producto);

      // Obtener el precio del producto desde la base de datos
      db.query('SELECT precio FROM Productos WHERE id_producto = ?', [id_producto], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const precio = result[0].precio;

        // Calcular el monto a devolver por el producto sin descuento
        let montoProducto = precio * cantidad;

        // Aplicar el descuento al monto total a devolver
        monto_a_devolver += montoProducto;

        detallesDevolucion.push({
          id_producto,
          cantidad,
          monto_a_reembolsar: montoProducto
        });

        // Si todos los productos fueron procesados
        if (detallesDevolucion.length === productos.length) {
          // Aplicar el descuento al monto total
          monto_a_devolver = monto_a_devolver * (1 - descuento / 100);

          // Crear la solicitud de devolución
          db.query('INSERT INTO Devoluciones (id_venta, id_cliente, monto_a_devolver) VALUES (?, ?, ?)', 
            [id_venta, id_cliente, monto_a_devolver], 
            (err, result) => {
              if (err) return res.status(500).send(err);

              const id_devolucion = result.insertId;

              // Registrar los detalles de la devolución
              detallesDevolucion.forEach((detalle) => {
                db.query('INSERT INTO DetallesDevolucion (id_devolucion, id_producto, cantidad, monto_a_reembolsar) VALUES (?, ?, ?, ?)',
                  [id_devolucion, detalle.id_producto, detalle.cantidad, detalle.monto_a_reembolsar],
                  (err) => {
                    if (err) return res.status(500).send(err);
                  });
              });

              return res.status(201).json({ message: 'Devolución solicitada exitosamente', id_devolucion });
            });
        }
      });
    });
  });
});

// READY
// Aprobar o rechazar una devolución
app.put('/devoluciones/estado/:id', (req, res) => {
  const { estado, comentario_rechazo } = req.body;
  const id_devolucion = req.params.id;

  // Cambiar el estado de la devolución
  let query = 'UPDATE Devoluciones SET estado = ? WHERE id_devolucion = ?';
  let params = [estado, id_devolucion];

  if (estado === 'Rechazada') {
    // Si es rechazada, agregar el comentario
    query = 'UPDATE Devoluciones SET estado = ?, comentario_rechazo = ? WHERE id_devolucion = ?';
    params = [estado, comentario_rechazo, id_devolucion];
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).send(err);

    if (estado === 'Aprobada') {
      // Si la devolución es aprobada, agregar el monto a la cartera del cliente
      db.query('SELECT id_cliente, monto_a_devolver FROM Devoluciones WHERE id_devolucion = ?', [id_devolucion], (err, result) => {
        if (err) return res.status(500).send(err);

        const { id_cliente, monto_a_devolver } = result[0];

        db.query('UPDATE Usuarios SET cartera = cartera + ? WHERE id_usuario = ?', [monto_a_devolver, id_cliente], (err) => {
          if (err) return res.status(500).send(err);

          return res.status(200).json({ message: 'Devolución aprobada y reembolso procesado.' });
        });
      });
    } else {
      return res.status(200).json({ message: 'Devolución rechazada.' });
    }
  });
});

// READY
app.get('/devoluciones/pendientes', (req, res) => {
  const query = 'SELECT id_devolucion, id_venta, id_cliente, monto_a_devolver, estado FROM Devoluciones WHERE estado = "Pendiente"';
  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(result);
  });
});

// Enviar notificación de rechazo al cliente
app.post('/notificar/rechazo', (req, res) => {
  const { id_cliente, comentario_rechazo } = req.body;

  // Obtener el email del cliente
  db.query('SELECT email, nombres, apellidos FROM Usuarios WHERE id_usuario = ?', [id_cliente], (err, result) => {
    if (err) return res.status(500).send(err);

    const cliente = result[0];
    const email = cliente.email;
    const nombre_completo = `${cliente.nombres} ${cliente.apellidos}`;

    // Configurar el correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Devolución Rechazada',
      text: `Hola ${nombre_completo},\n\nTu solicitud de devolución ha sido rechazada. Motivo: ${comentario_rechazo}\n\nSi tienes dudas, contacta con soporte.`
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return res.status(500).send(err);
      res.status(200).json({ message: 'Correo enviado al cliente' });
    });
  });
});

// READY
// Ruta para obtener todas las compras de un cliente
app.get('/compras', verifyToken, (req, res) => {
  const id_cliente = req.user.sub.id;

  // Consultar todas las ventas realizadas por el cliente
  db.query(`
    SELECT v.id_venta, v.fecha_venta, SUM(dv.cantidad * p.precio) * (1 - (v.descuento / 100)) AS total
    FROM Ventas v
    JOIN DetallesVentas dv ON v.id_venta = dv.id_venta
    JOIN Productos p ON p.id_producto = dv.id_producto
    LEFT JOIN Devoluciones d ON v.id_venta = d.id_venta AND d.id_cliente = v.id_cliente
    WHERE v.id_cliente = ?
    AND (d.id_devolucion IS NULL)
    GROUP BY v.id_venta, v.fecha_venta
    ORDER BY v.fecha_venta DESC
  `, [id_cliente], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result); // Retorna todas las compras del cliente
  });
});

// READY
// Ruta para obtener los productos de una compra específica
app.get('/productos/venta', (req, res) => {
  const { id_venta } = req.query;

  db.query(`
    SELECT 
        p.id_producto, 
        p.nombre_producto, 
        p.precio * (1 - (v.descuento / 100)) AS precio, 
        dv.cantidad
    FROM DetallesVentas dv
    JOIN Productos p ON p.id_producto = dv.id_producto
    JOIN Ventas v ON v.id_venta = dv.id_venta
    WHERE dv.id_venta = ?`,
    [id_venta], 
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result); // Retorna los productos de la compra
    });
});


module.exports = app;