import React, { useState, useEffect } from 'react';
import { Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, Box, TextField, Typography, IconButton } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';  // Importa la configuración regional en español
moment.locale('es');

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavbarAdmin from './NavbarAdmin';

const apiUrl = import.meta.env.VITE_API_URL;

const CuponesList = () => {
    const [cupones, setCupones] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCupón, setEditingCupón] = useState(null);
    const [cuponData, setCuponData] = useState({
        codigo_cupon: '',
        descuento: '',
        fecha_vencimiento: '',
        usos_totales: '',
        usos_por_cliente: '',
        estado: 'Activo'
    });
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [cupónToDelete, setCupónToDelete] = useState(null);

    // Fetch all cupones
    useEffect(() => {
        fetchCupones();
    }, []);

    const fetchCupones = async () => {
        try {
            const response = await axios.get(`http://saf1.${apiUrl}.nip.io/nodem8/api/cupones`); // Cambia el endpoint si es necesario
            setCupones(response.data);
            console.log(response.data);
            
        } catch (error) {
            setCupones([]);
            console.error('Error al obtener cupones:', error);
        }
    };

    // Open Modal for Adding or Editing Cupón
    const openModal = (cupón = null) => {
        if (cupón) {
            setEditingCupón(cupón);
            setCuponData({
                codigo_cupon: cupón.codigo_cupon,
                descuento: cupón.descuento,
                fecha_vencimiento: cupón.fecha_vencimiento,
                usos_totales: cupón.usos_totales,
                usos_por_cliente: cupón.usos_por_cliente,
                estado: cupón.estado
            });
        } else {
            setEditingCupón(null);
            setCuponData({
                codigo_cupon: '',
                descuento: '',
                fecha_vencimiento: '',
                usos_totales: '',
                usos_por_cliente: '',
                estado: 'Activo'
            });
        }
        setModalOpen(true);
    };

    // Close Modal
    const closeModal = () => {
        setModalOpen(false);
    };

    // Handle Form Input Change
    const handleChange = (e) => {
        setCuponData({
            ...cuponData,
            [e.target.name]: e.target.value
        });
    };

    // Create or Edit Cupón
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCupón) {
                // Edit cupón
                await axios.put(`http://saf1.${apiUrl}.nip.io/nodem8/api/cupon/${editingCupón.id_cupon}`, cuponData);
                alert('Cupón actualizado');
            } else {
                // Create new cupón
                await axios.post(`http://saf1.${apiUrl}.nip.io/nodem8/api/cupon`, cuponData);
                alert('Cupón creado');
            }
            fetchCupones();
            closeModal();
        } catch (error) {
            console.error('Error al guardar el cupón:', error);
        }
    };

    // Open Delete Confirmation Modal
    const handleDelete = (cupón) => {
        setCupónToDelete(cupón);
        setConfirmDelete(true);
    };

    // Confirm Deleting a Cupón
    const confirmDeleteCupón = async () => {
        try {
            cuponData.estado = 'Inactivo'
            await axios.put(`http://saf1.${apiUrl}.nip.io/nodem8/api/cupon/${cupónToDelete.id_cupon}`, cuponData);
            // await axios.delete(`http://saf1.${apiUrl}.nip.io/nodem8/api/cupon/${cupónToDelete.id_cupon}`);
            alert('Cupón eliminado');
            fetchCupones();
        } catch (error) {
            console.error('Error al eliminar el cupón:', error);
        }
        setConfirmDelete(false);
    };

    const formatDate = (fecha) => {
      return moment(fecha).format('DD MMMM YYYY'); // Ejemplo: "01 diciembre 2024"
    };

    
    

    return (
        <>
            <Container>
                <Typography variant="h4" gutterBottom>
                    Gestión de Cupones
                </Typography>
                <Button variant="contained" color="primary" onClick={() => openModal()}>Agregar Cupón</Button>

                <TableContainer component={Paper} sx={{ marginTop: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Codigo</TableCell>
                                <TableCell>Descuento</TableCell>
                                <TableCell>Fecha Vencimiento</TableCell>
                                <TableCell>Usos Totales</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cupones.map((cupon) => (
                                <TableRow key={cupon.id_cupon}>
                                    <TableCell>{cupon.codigo_cupon}</TableCell>
                                    <TableCell>{cupon.descuento}%</TableCell>
                                    <TableCell>{formatDate(cupon.fecha_vencimiento)}</TableCell>
                                    <TableCell>{cupon.usos_totales}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => openModal(cupon)}><EditIcon /></IconButton>
                                        <IconButton onClick={() => handleDelete(cupon)}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Modal de Agregar/Editar */}
                <Modal open={modalOpen} onClose={closeModal}>
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper', padding: 3, borderRadius: 2, boxShadow: 24
                    }}>
                        <Typography variant="h6">{editingCupón ? 'Editar Cupón' : 'Agregar Cupón'}</Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Código de Cupón"
                                name="codigo_cupon"
                                value={cuponData.codigo_cupon}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ marginBottom: 2 }}
                            />
                            <TextField
                                label="Descuento"
                                name="descuento"
                                value={cuponData.descuento}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ marginBottom: 2 }}
                            />
                            <TextField
                                label="Fecha de Vencimiento"
                                name="fecha_vencimiento"
                                type="date"
                                value={cuponData.fecha_vencimiento}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ marginBottom: 2 }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                label="Usos Totales"
                                name="usos_totales"
                                value={cuponData.usos_totales}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ marginBottom: 2 }}
                            />
                            <TextField
                                label="Usos por Cliente"
                                name="usos_por_cliente"
                                value={cuponData.usos_por_cliente}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ marginBottom: 2 }}
                            />
                            <Button type="submit" variant="contained" color="primary">Guardar</Button>
                        </form>
                    </Box>
                </Modal>

                {/* Modal de Confirmación de Eliminar */}
                <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper', padding: 3, borderRadius: 2, boxShadow: 24
                    }}>
                        <Typography variant="h6">¿Estás seguro de que deseas eliminar este cupón?</Typography>
                        <Button onClick={confirmDeleteCupón} color="error" variant="contained" sx={{ marginTop: 2 }}>Eliminar</Button>
                        <Button onClick={() => setConfirmDelete(false)} color="primary" variant="contained" sx={{ marginTop: 2 }}>Cancelar</Button>
                    </Box>
                </Modal>
            </Container>
        </>
    );
};

export default CuponesList;