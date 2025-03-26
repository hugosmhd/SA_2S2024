const cron = require('node-cron');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');

// Configuración de conexión a la base de datos
const db = mysql.createPool({
    host: '35.184.59.66',
    user: 'root',
    password: 'J)P%`>>`@`m0$LFv',
    database: 'eCommerce',
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes usar otro servicio como Outlook, Yahoo, etc.
    auth: {
        user: 'hugo.kio40@gmail.com',
        pass: 'oxtw kyau bslg kfza', // Usa contraseñas de aplicación si es necesario
    },
});

// Función para verificar stock bajo y enviar correos
const checkLowStockAndNotify = async () => {
    console.log(`[${new Date().toLocaleString()}] Función ejecutada: Verificar stock bajo y enviar notificaciones.`);
    try {
        // Consulta para obtener productos con stock <= 10
        const [productos] = await db.query(`
            SELECT 
                p.id_producto,
                p.nombre_producto,
                p.stock,
                u.email
            FROM Productos p
            JOIN Usuarios u ON p.id_proveedor = u.id_usuario
            WHERE p.stock <= 10
        `);

        // Agrupar productos por email del proveedor
        const productosPorProveedor = productos.reduce((agrupados, producto) => {
            const { email } = producto;
            if (!agrupados[email]) {
                agrupados[email] = [];
            }
            agrupados[email].push(producto);
            return agrupados;
        }, {});

        // Enviar un correo por proveedor con la lista de productos
        for (const [email, productos] of Object.entries(productosPorProveedor)) {
            // Crear el cuerpo del correo con la lista de productos
            const listaProductos = productos
                .map(p => `- ${p.nombre_producto} (Stock actual: ${p.stock})`)
                .join('\n');

            const mailOptions = {
                from: 'EconoMarket',
                to: email,
                subject: 'Notificación: Stock bajo de productos',
                text: `Hola, los siguientes productos tienen stock bajo:\n\n${listaProductos}\n\nPor favor, considera reponerlos.`,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Correo enviado a ${email} con la lista de productos de stock bajo.`);
        }
    } catch (error) {
        console.error('Error al verificar el stock o enviar correos:', error);
    }
};

// Programar el cron job para ejecutarse cada hora
cron.schedule('*/3 * * * *', () => {
    console.log('Verificando stock bajo y enviando notificaciones...');
    checkLowStockAndNotify();
});