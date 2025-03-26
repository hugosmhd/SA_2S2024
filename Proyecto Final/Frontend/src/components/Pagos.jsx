import { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';

import Navbar from "./Navbar"

export const Pagos = () => {

    const token = localStorage.getItem('token');  

    const [open, setOpen] = useState(false);
    const [openDeleteTarjeta, setOpenDeleteTarjeta] = useState(false);
    const [openRecargar, setOpenRecargar] = useState(false);
    const [idTarjeta, setIdTarjeta] = useState(0);

    const [formData, setFormData] = useState({
        id_cliente: 0,
        numero_tarjeta: '',
        fecha_vencimiento: '',
        cvc: 0,
        monto: 0
    });

    const [tarjetas, setTarjetas] = useState([])
    const [cartera, setCartera] = useState(0)

    useEffect(() => {

        fetchTarjetas();
        
        setFormData((prevData) => ({
            ...prevData,
        }));
    
    }, []);

    const fetchTarjetas = () => {
        axios
        .get('http://saf1.35.192.41.172.nip.io/nodem4/api/tarjetas',{
            headers: {
                'Authorization': `Bearer ${token}`  // Agregar el token en el encabezado Authorization
            }
        })
        .then((response) => {
            setTarjetas(response.data.data);
            console.log(response.data.data);
            
        })
        .catch((error) => {
            console.error('Error al obtener los tarjetas:', error);
        });

        axios
        .get('http://saf1.35.192.41.172.nip.io/nodem4/api/cartera', {
            headers: {
                'Authorization': `Bearer ${token}`  // Agregar el token en el encabezado Authorization
            }
        })
        .then((response) => {
            setCartera(response.data);
            console.log(response.data);
            
        })
        .catch((error) => {
            console.error('Error al obtener los productos:', error);
        });
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenDeleteTarjeta = (idTarjeta) => {
        setOpenDeleteTarjeta(true);
        setIdTarjeta(idTarjeta);

    };

    const handleCloseDeleteTarejeta = () => {
        setOpenDeleteTarjeta(false);
    };

    const handleOpenRecargar = () => {
        setOpenRecargar(true);
    };

    const handleCloseRecargar = () => {
        setOpenRecargar(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        formData.cvc = Number(formData.cvc); 
        console.log('Formulario enviado:', formData);
        try {
            const response = await axios.post("http://saf1.35.192.41.172.nip.io/nodem4/api/tarjetas", formData, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Agregar el token en el encabezado Authorization
                }
            });

            console.log("Respuesta del servidor:", response.data);
            setTarjetas([...tarjetas, formData]);
        } catch (error) {
            console.error("Hubo un error al enviar el formulario:", error);
        }
        handleClose();
    };

    const handleSubmitDeleteTarjeta = async (e) => {
        e.preventDefault();
        // Aquí iría la lógica para agregar la tarjeta
        console.log('Formulario enviado:', idTarjeta);

        try {
            // Cambia la URL a la de tu API
            const response = await axios.delete("http://saf1.35.192.41.172.nip.io/nodem4/api/tarjetas/"+idTarjeta);

            // Manejo de la respuesta
            console.log("Respuesta del servidor:", response.data);
            setTarjetas(tarjetas.filter(tarjeta => tarjeta.id_tarjeta !== idTarjeta));
            // Aquí podrías hacer algo con la respuesta, como cerrar el modal, limpiar el formulario, etc.
        } catch (error) {
            // Manejo de errores
            console.error("Hubo un error al enviar el formulario:", error);
        }
        // Cerrar el modal después de enviar
        // closeModalDeleteBook();
        handleCloseDeleteTarejeta();
    };

    const handleSubmitRecargar = async (e) => {
        e.preventDefault();
        formData.monto = Number(formData.monto); 
        console.log('Formulario enviado:', formData);
        try {
            const response = await axios.put("http://saf1.35.192.41.172.nip.io/nodem4/api/cartera", formData, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Agregar el token en el encabezado Authorization
                }
            });

            console.log("Respuesta del servidor:", response.data);
            const newValue = {
                cartera: formData.monto + cartera.cartera
            }
            setCartera(newValue)
        } catch (error) {
            console.error("Hubo un error al enviar el formulario:", error);
        }
        handleCloseRecargar();
    };

    return (
        <>
            <Navbar />
            <h1>Tarjetas de crédito/débito</h1>
            <Paper elevation={3} style={{ padding: '16px' }}>
                <Grid container>
                    <Grid item xs={3}>
                        <Box display="flex" flexDirection="column" alignItems="center" height="100%">
                            <img
                                src="/tarjetas.png"
                                alt="Imagen de ejemplo"
                                style={{ width: '35%', height: 'auto' }}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpen}
                                style={{ marginTop: '20px' }}
                            >
                                Agregar tarjeta
                            </Button>

                        </Box>
                    </Grid>

                    <Grid item xs={9}>
                        <Typography variant="h6">Tarjetas Agregadas</Typography>
                        <List>
                            {tarjetas.map((tarjeta) => (
            <ListItem key={tarjeta.id_tarjeta} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ListItemText
                primary={`Numero: ${tarjeta.numero_tarjeta}`}
                secondary={`Fecha Vencimiento: ${tarjeta.fecha_vencimiento}`}
              />
              <IconButton color="error" onClick={() => handleOpenDeleteTarjeta(tarjeta.id_tarjeta)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
                        </List>
                    </Grid>
                </Grid>
            </Paper>

            <h1>Recargar cartera</h1>
            <Paper elevation={3} style={{ padding: '16px' }}>
                <Grid container>
                    <Grid item xs={3}>
                        <Box display="flex" flexDirection="column" alignItems="center" height="100%">
                            <img
                                src="/billetera.png"
                                alt="Billetera"
                                style={{ width: '35%', height: 'auto' }}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenRecargar}
                                style={{ marginTop: '20px' }}
                            >
                                Recargar tarjeta
                            </Button>

                        </Box>
                    </Grid>

                    <Grid item xs={9}>
                        <Grid
                            style={{ display: 'flex',justifyContent: 'space-between' }}
                        >
                        <Typography variant="h5">Saldo actual:</Typography>
                        <Typography variant="h6">Q.{cartera.cartera}</Typography>

                        </Grid>
                        
                    </Grid>
                </Grid>
            </Paper>

            {/* Modal agregar tarjeta */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Agregar Nueva Tarjeta</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <TextField
                                fullWidth
                                label="Número de la tarjeta"
                                type="number"
                                variant="outlined"
                                name="numero_tarjeta"
                                value={formData.numero_tarjeta}
                                onChange={handleInputChange}
                                style={{ marginBottom: '16px' }}
                            />
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                label="Fecha de vencimiento"
                                type="date"
                                variant="outlined"
                                name="fecha_vencimiento"
                                value={formData.fecha_vencimiento}
                                onChange={handleInputChange}
                                style={{ marginBottom: '16px', marginTop: '15px' }}
                                InputLabelProps={{
                                    shrink: true, // Asegura que la etiqueta no se superponga
                                  }}
                            />
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                label="CVC"
                                variant="outlined"
                                name="cvc"
                                value={formData.cvc}
                                onChange={handleInputChange}
                                style={{ marginBottom: '16px', marginTop: '15px' }}
                            />
                        </div>
                        
                        <DialogActions>
                            <Button onClick={handleClose} color="secondary">
                                Cancelar
                            </Button>
                            <Button type="submit" color="primary">
                                Agregar
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal eliminar tarjeta                       */}
            <Dialog open={openDeleteTarjeta} onClose={handleCloseDeleteTarejeta}>
                <DialogTitle>¿Está seguro de eliminar la tarjeta?</DialogTitle>
                <DialogContent>
                <form onSubmit={handleSubmitDeleteTarjeta}>
                    

                    <DialogActions>
                        <Button onClick={handleCloseDeleteTarejeta} color="secondary">
                            Cancelar
                        </Button>
                        <Button type="submit" color="primary">
                            Eliminar
                        </Button>
                    </DialogActions>
                </form>
                    
                </DialogContent>
            </Dialog>

            {/* Modal recargar tarjeta */}
            <Dialog open={openRecargar} onClose={handleCloseRecargar}>
                <DialogTitle>Recargar cartera</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmitRecargar}>
                        <div>
                            <TextField
                                fullWidth
                                label="Monto"
                                variant="outlined"
                                name="monto"
                                value={formData.monto}
                                onChange={handleInputChange}
                                style={{ marginBottom: '16px', marginTop: '15px' }}
                            />
                        </div>
                        
                        <DialogActions>
                            <Button onClick={handleCloseRecargar} color="secondary">
                                Cancelar
                            </Button>
                            <Button type="submit" color="primary">
                                Recargar
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
