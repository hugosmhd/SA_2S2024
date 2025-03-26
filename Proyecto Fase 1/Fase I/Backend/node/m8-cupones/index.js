const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./src/config/database');
const cuponesRoutes = require('./src/routes/cupones');

dotenv.config(); // Cargar variables de entorno
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use('/api', cuponesRoutes);

app.get('/', function (req, res) {
    res.send('hello, world!')
})

// Conectar a la base de datos y arrancar el servidor
sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar a la base de datos:', error);
    });