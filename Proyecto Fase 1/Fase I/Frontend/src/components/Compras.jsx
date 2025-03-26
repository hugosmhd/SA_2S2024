import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Button, Grid } from '@mui/material';
import DevolucionesForm from './DevolucionesForm';
// import { obtenerComprasCliente, obtenerProductosDeVenta } from '../api';
import axios from 'axios';
import Navbar from './Navbar';

const apiUrl = import.meta.env.VITE_API_URL;

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const idCliente = 21; // ID del cliente (esto debería venir de la sesión o el estado global)
  // Obtener todas las compras de un cliente
  const obtenerComprasCliente = (idCliente) => {
    return axios.get(`http://saf1.${apiUrl}.nip.io/nodem9/api/compras`, {
      params: { id_cliente: idCliente }
    });
  };

  // Obtener los productos de una compra específica
  const obtenerProductosDeVenta = (idVenta, idCliente) => {
    return axios.get(`http://saf1.${apiUrl}.nip.io/nodem9/api/productos/venta`, {
      params: { id_venta: idVenta, id_cliente: idCliente }
    });
  };
  // Obtener las compras del cliente
  useEffect(() => {
    fetchCompras();
  }, [idCliente]);
  const fetchCompras = async () => {
    const currentToken = localStorage.getItem('token');
    setIsLoading(true);
    try {
      const response = await axios.get(`http://saf1.${apiUrl}.nip.io/nodem9/api/compras`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        }
      });
      setCompras(response.data); // Guardamos las compras del cliente
    } catch (error) {
      console.error('Error al obtener las compras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener los productos de una compra seleccionada
  const handleSeleccionarCompra = async (idVenta) => {
    const currentToken = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://saf1.${apiUrl}.nip.io/nodem9/api/productos/venta`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        params: { id_venta: idVenta }
      });
      console.log(response.data);

      setProductosDisponibles(response.data); // Guardamos los productos de la venta seleccionada
      setSeleccionada(idVenta); // Marcamos la compra seleccionada
      setOpenModal(true); // Abrimos el modal
    } catch (error) {
      console.error('Error al obtener los productos de la venta:', error);
    } finally {
      setIsLoading(false);
    }
  };

// Función para manejar el envío del formulario de devolución
const handleDevolucionSubmit = async (idCliente, idVenta, productosADevolver) => {
  // Lógica para procesar la devolución (esto debería llamarse a la API)
  console.log(idCliente, idVenta);
  console.log('Devolución solicitada para los productos:', productosADevolver);

  const formData = {
    id_venta: idVenta,
    id_cliente: idCliente,
    productos: productosADevolver
  };

  // Obtener el token del localStorage
  const currentToken = localStorage.getItem('token');

  try {
    // Enviar los datos a la API para procesar la devolución
    const response = await axios.post(
      `http://saf1.${apiUrl}.nip.io/nodem9/api/devoluciones`, 
      formData, 
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          // Otros encabezados, si los necesitas
        }
      }
    );

    console.log('Respuesta de la API:', response.data);
    alert('Devolución procesada exitosamente');
    fetchCompras(); // Actualizar la lista de compras
  } catch (error) {
    console.error('Error al procesar la devolución:', error);
    alert('Hubo un error al procesar la devolución. Por favor, inténtalo nuevamente.');
  }
};


  return (
    <>
      <Navbar />
      <Container>
        <Typography variant="h4" gutterBottom>
          Solicitar Devolución de Productos
        </Typography>

        {/* Lista de compras del cliente */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Mis Compras
          </Typography>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {compras.map((compra) => (
                <Grid item xs={12} sm={6} md={4} key={compra.id_venta}>
                  <Box p={2} border={1} borderRadius="8px" borderColor="grey.400">
                    <Typography variant="body1">Compra #{compra.id_venta}</Typography>
                    <Typography variant="body2" color="textSecondary">Fecha: {new Date(compra.fecha_venta).toLocaleDateString()}</Typography>
                    <Typography variant="body2" color="primary">Total: Q{parseFloat(compra.total).toFixed(2)}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSeleccionarCompra(compra.id_venta)}
                    >
                      Ver Productos
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Modal para solicitar la devolución */}
        <DevolucionesForm
          open={openModal}
          onClose={() => setOpenModal(false)}
          idCliente={idCliente}
          idVenta={seleccionada}
          productosDisponibles={productosDisponibles}
          onDevolucionSubmit={handleDevolucionSubmit}
        />
      </Container>
    </>
  );
};

export default Compras;
