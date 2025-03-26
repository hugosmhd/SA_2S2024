// controllers/carteraController.js
const nodemailer = require('nodemailer');
const notificacionService = require('../services/notificacionService');

const agregarNotificacion = async (req, res) => {
    try {
        const { email, nombres, apellidos }  = await notificacionService.correoUsuario(req.body.id_venta);
        const productos  = await notificacionService.productosVenta(req.body.id_venta);

        // Construir la tabla HTML
        let productTable = `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        `;

        productos.forEach((product) => {
            productTable += `
                <tr>
                    <td>${product.nombre_producto}</td>
                    <td>${product.cantidad}</td>
                    <td>$${product.subtotal}</td>
                </tr>
            `;
        });

        // Agregar el total al final de la tabla
        const total = productos[0].total;
        productTable += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="text-align: right; font-weight: bold;">Total</td>
                        <td>$${total}</td>
                    </tr>
                </tfoot>
            </table>
        `;

        const transporter = nodemailer.createTransport({
            service: 'gmail', // Puedes usar otro servicio como Outlook, Yahoo, etc.
            auth: {
                user: 'hugo.kio40@gmail.com',
                pass: 'oxtw kyau bslg kfza', // Usa contraseñas de aplicación si es necesario
            },
        });

        // Configurar el contenido del correo
        const mailOptions = {
            from: 'sag14@gmail.com',
            to: email,
            subject: 'Detalles de tu compra',
            html: `
                <h1>Hola ${nombres} ${apellidos}, gracias por tu compra</h1>
                <p>Estos son los detalles de tu pedido:</p>
                ${productTable}
                <p>Gracias por confiar en nosotros.</p>
            `
        };

        // Enviar el correo
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Correo enviado:', info.response);
        } catch (error) {
            console.error('Error al enviar el correo:', error);
        }
        
        res.json({ message: 'Datos recibidos con éxito', data: req.body });
        // res.status(201).json({ success: true, tarjeta });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { agregarNotificacion };
