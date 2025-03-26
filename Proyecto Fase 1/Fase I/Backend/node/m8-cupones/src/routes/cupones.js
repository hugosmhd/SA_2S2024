const express = require('express');
const jwt = require('jsonwebtoken');
const Cupon = require('../models/Cupon');
const UsosCupones = require('../models/UsosCupones');  // Importamos el modelo de UsosCupones
const router = express.Router();

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

// Crear un cupón
router.post('/cupon', async (req, res) => {
    const { codigo_cupon, descuento, fecha_vencimiento, usos_totales, usos_por_cliente, estado } = req.body;
    try {
        const cuponNuevo = await Cupon.create({
            codigo_cupon,
            descuento,
            fecha_vencimiento,
            usos_totales,
            usos_por_cliente,
            estado
        });
        res.status(201).json(cuponNuevo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el cupón' });
    }
});

// Editar un cupón
router.put('/cupon/:id', async (req, res) => {
    const { id } = req.params;
    const { codigo_cupon, descuento, fecha_vencimiento, usos_totales, usos_por_cliente, estado } = req.body;
    try {
        const cupón = await Cupon.findByPk(id);
        if (!cupón) {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }
        // Actualizar los campos
        cupón.codigo_cupon = codigo_cupon || cupón.codigo_cupon;
        cupón.descuento = descuento || cupón.descuento;
        cupón.fecha_vencimiento = fecha_vencimiento || cupón.fecha_vencimiento;
        cupón.usos_totales = usos_totales || cupón.usos_totales;
        cupón.usos_por_cliente = usos_por_cliente || cupón.usos_por_cliente;
        cupón.estado = estado || cupón.estado;
        await cupón.save();
        res.json(cupón);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el cupón' });
    }
});

// Obtener un cupón
router.get('/cupon', verifyToken, async (req, res) => {
    const { codigo_cupon } = req.query;
    const id_cliente = req.user.sub.id;
    try {
        // Buscar el cupón en la base de datos
        const cupon = await Cupon.findOne({ where: { codigo_cupon, estado: 'Activo' } });
        if (!cupon) {
            return res.status(404).json({ message: 'Cupón no válido o no activo' });
        }

        // Verificar si el cupón ha vencido
        if (new Date() > new Date(cupon.fecha_vencimiento)) {
            return res.status(400).json({ message: 'El cupón ha vencido' });
        }
        
        // Verificar si el cupón ha alcanzado su límite de usos globales
        const totalUsosCupon = await UsosCupones.count({ where: { id_cupon: cupon.id_cupon } });
        if (totalUsosCupon >= cupon.usos_totales) {
            return res.status(400).json({ message: 'El cupón ha sido utilizado demasiadas veces' });
        }

        // Verificar si el cliente ha utilizado el cupón más veces de lo permitido
        const usosCliente = await UsosCupones.count({
            where: {
                id_cliente,
                id_cupon: cupon.id_cupon
            }
        });

        if (usosCliente >= cupon.usos_por_cliente) {
            return res.status(400).json({ message: 'Has alcanzado el límite de uso de este cupón' });
        }

        // res.json(cupon);
        cupon.descuento *= 1;
        res.status(201).json(cupon);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el cupón' });
    }
});

// Eliminar un cupón
router.delete('/cupon/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const cupón = await Cupon.findByPk(id);
        if (!cupón) {
            return res.status(404).json({ message: 'Cupón no encontrado' });
        }
        await cupón.destroy();
        res.status(204).json({ message: 'Cupón eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el cupón' });
    }
});

// Endpoint para obtener todos los cupones activos
router.get('/cupones', async (req, res) => {
    try {
        // Obtener todos los cupones activos
        const cupones = await Cupon.findAll({
            where: {
                estado: 'Activo'
            }
        });

        // Si no hay cupones activos
        if (cupones.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron cupones activos.'
            });
        }

        // Enviar los cupones como respuesta
        return res.status(200).json(cupones);
    } catch (error) {
        console.error('Error al obtener los cupones:', error);
        return res.status(500).json({
            message: 'Error interno del servidor. Intente nuevamente más tarde.'
        });
    }
});

// Endpoint para aplicar un cupón
router.post('/aplicar-cupon', verifyToken, async (req, res) => {
    const { codigo_cupon } = req.body;  // Datos recibidos del cliente
    const id_cliente = req.user.sub.id;

    try {
        // Verificar que el cliente exista
        // const cliente = await Usuarios.findByPk(id_cliente);
        // if (!cliente) {
        //     return res.status(404).json({ message: 'Cliente no encontrado' });
        // }

        // Buscar el cupón en la base de datos
        const cupon = await Cupon.findOne({ where: { codigo_cupon, estado: 'Activo' } });
        if (!cupon) {
            return res.status(404).json({ message: 'Cupón no válido o no activo' });
        }

        // Verificar si el cupón ha vencido
        if (new Date() > new Date(cupon.fecha_vencimiento)) {
            return res.status(400).json({ message: 'El cupón ha vencido' });
        }
        
        // Verificar si el cupón ha alcanzado su límite de usos globales
        const totalUsosCupon = await UsosCupones.count({ where: { id_cupon: cupon.id_cupon } });
        if (totalUsosCupon >= cupon.usos_totales) {
            return res.status(400).json({ message: 'El cupón ha sido utilizado demasiadas veces' });
        }

        // Verificar si el cliente ha utilizado el cupón más veces de lo permitido
        const usosCliente = await UsosCupones.count({
            where: {
                id_cliente,
                id_cupon: cupon.id_cupon
            }
        });

        if (usosCliente >= cupon.usos_por_cliente) {
            return res.status(400).json({ message: 'Has alcanzado el límite de uso de este cupón' });
        }

        // Calcular el descuento
        // const descuento = (cupon.descuento / 100) * total_carrito;
        // const totalConDescuento = total_carrito - descuento;

        // Actualizar los contadores de uso del cupón
        cupon.usos_actuales += 1;
        await cupon.save();

        // Registrar el uso del cupón en la tabla UsosCupones
        await UsosCupones.create({
            id_cliente,
            id_cupon: cupon.id_cupon
        });

        // Aquí puedes guardar también el uso del cupón por cliente (si necesitas llevar el control del cliente que lo usó)
        // Si tienes una tabla de "UsosCuponesPorCliente", puedes registrar el uso de este cupón allí también.

        // Responder con el total después de aplicar el descuento
        res.json({
            mensaje: 'Cupón aplicado correctamente',
            // totalOriginal: total_carrito,
            // descuento,
            // totalConDescuento
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al aplicar el cupón' });
    }
});

module.exports = router;
