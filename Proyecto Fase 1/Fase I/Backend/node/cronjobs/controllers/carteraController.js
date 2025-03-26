// controllers/carteraController.js
const carteraService = require('../services/carteraService');

const agregarCartera = async (req, res) => {
    try {
        const id_cliente = req.user.sub.id;
        const { monto } = req.body;
        const tarjeta = await carteraService.agregarCartera(id_cliente, monto);
        res.status(201).json({ success: true, tarjeta });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const valorCartera = async (req, res) => {
    try {
        const id_cliente = req.user.sub.id;
        const [{cartera}] = await carteraService.valorCartera(id_cliente);
        
        res.status(201).json({ success: true, cartera });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { agregarCartera, valorCartera };
