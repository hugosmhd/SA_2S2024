require('dotenv').config(); // Para cargar las variables del .env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const devolucionesRoutes = require('./src/routes/devoluciones');
// const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // Para manejar JSON en las peticiones
app.use(cors());

// Rutas
app.use('/api', devolucionesRoutes);

app.get('/', function (req, res) {
    res.send('hello, world!')
})

// Iniciar el servidor Express
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
