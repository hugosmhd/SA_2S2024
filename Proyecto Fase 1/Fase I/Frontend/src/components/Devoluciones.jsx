import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  TextField, 
  Modal, 
  Box, 
  Typography 
} from '@mui/material';
import NavbarAdmin from './NavbarAdmin';

const apiUrl = import.meta.env.VITE_API_URL;
const baseUrl = `http://saf1.${apiUrl}.nip.io/nodem9/api`; // Cambia esto por la URL de tu API

const Devoluciones = () => {
  const [devoluciones, setDevoluciones] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [comentarioRechazo, setComentarioRechazo] = useState('');
  const [devolucionId, setDevolucionId] = useState(null);

  // Cargar devoluciones pendientes
  useEffect(() => {
    const fetchDevoluciones = async () => {
      try {
        const response = await axios.get(`${baseUrl}/devoluciones/pendientes`);
        setDevoluciones(response.data);
      } catch (error) {
        console.error('Error al cargar las devoluciones', error);
      }
    };
    fetchDevoluciones();
  }, []);

  // Aprobar devolución
  const aprobarDevolucion = async (idDevolucion) => {
    try {
      await axios.put(`${baseUrl}/devoluciones/estado/${idDevolucion}`, {
        estado: 'Aprobada',
      });
      alert('Devolución aprobada');
      setDevoluciones(devoluciones.filter(d => d.id_devolucion !== idDevolucion)); // Eliminar de la lista
    } catch (error) {
      console.error('Error al aprobar la devolución', error);
    }
  };

  // Rechazar devolución
  const rechazarDevolucion = async () => {
    if (!comentarioRechazo) {
      alert('Por favor, ingrese un comentario de rechazo.');
      return;
    }

    try {
      await axios.put(`${baseUrl}/devoluciones/estado/${devolucionId}`, {
        estado: 'Rechazada',
        comentario_rechazo: comentarioRechazo,
      });
      alert('Devolución rechazada');
      setDevoluciones(devoluciones.filter(d => d.id_devolucion !== devolucionId)); // Eliminar de la lista
      setOpenModal(false);
      setComentarioRechazo('');
    } catch (error) {
      console.error('Error al rechazar la devolución', error);
    }
  };

  // Abrir el modal para rechazo
  const handleOpenModal = (idDevolucion) => {
    setDevolucionId(idDevolucion);
    setOpenModal(true);
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setComentarioRechazo('');
  };

  return (
    <>
      <NavbarAdmin />
      <Container>
        <Typography variant="h4" gutterBottom>
          Devoluciones Pendientes
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Devolución</TableCell>
                <TableCell>ID Venta</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Monto a devolver</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devoluciones.map((devolucion) => (
                <TableRow key={devolucion.id_devolucion}>
                  <TableCell>{devolucion.id_devolucion}</TableCell>
                  <TableCell>{devolucion.id_venta}</TableCell>
                  <TableCell>{devolucion.id_cliente}</TableCell>
                  <TableCell>{devolucion.monto_a_devolver}</TableCell>
                  <TableCell>{devolucion.estado}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="success" 
                      onClick={() => aprobarDevolucion(devolucion.id_devolucion)}
                      style={{marginRight: 3}}
                    >
                      Aprobar
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      onClick={() => handleOpenModal(devolucion.id_devolucion)}
                    >
                      Rechazar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal para el comentario de rechazo */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: 4,
            borderRadius: 1,
            boxShadow: 24,
            width: 400
          }}>
            <Typography id="modal-title" variant="h6" component="h2">
              Ingrese un comentario para rechazar la devolución
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={comentarioRechazo}
              onChange={(e) => setComentarioRechazo(e.target.value)}
              placeholder="Comentario de rechazo"
              sx={{ marginTop: 2 }}
            />
            <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseModal} color="secondary" sx={{ marginRight: 1 }}>Cancelar</Button>
              <Button onClick={rechazarDevolucion} color="error">Rechazar</Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </>
  );
};

export default Devoluciones;
