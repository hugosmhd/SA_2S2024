// routes/tarjetaRoutes.js
const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');

router.post('/notificacion', notificacionController.agregarNotificacion);

module.exports = router;
