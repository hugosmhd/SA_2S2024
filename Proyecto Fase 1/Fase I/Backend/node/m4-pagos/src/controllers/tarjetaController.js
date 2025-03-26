// controllers/tarjetaController.js
const tarjetaService = require('../services/tarjetaService');

const agregarTarjeta = async (req, res) => {
    try {
        const id_cliente = req.user.sub.id;
        
        const { numero_tarjeta, fecha_vencimiento, cvc } = req.body;
        const tarjeta = await tarjetaService.agregarTarjeta(id_cliente, numero_tarjeta, fecha_vencimiento, cvc);
        res.status(201).json({ success: true, tarjeta });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const eliminarTarjeta = async (req, res) => {
    try {
        const { id_tarjeta } = req.params;
        await tarjetaService.eliminarTarjeta(id_tarjeta);
        res.status(200).json({ success: true, message: 'Tarjeta eliminada exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const clienteTarjetas = async (req, res) => {
    try {
        const id_cliente = req.user.sub.id;
        
        const data = await tarjetaService.clienteTarjetas(id_cliente);
        res.status(200).json({ success: true, message: 'Tarjetas encontradas.', data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { agregarTarjeta, eliminarTarjeta, clienteTarjetas };
