// routes/tarjetaRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const tarjetaController = require('../controllers/tarjetaController');

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

router.post('/tarjetas', verifyToken, tarjetaController.agregarTarjeta);
router.delete('/tarjetas/:id_tarjeta', tarjetaController.eliminarTarjeta);
router.get('/tarjetas', verifyToken, tarjetaController.clienteTarjetas);

module.exports = router;
