import { useEffect, useState } from 'react';
import axios from 'axios';
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
import { useModal } from './context/ModalContext'

const apiUrl = import.meta.env.VITE_API_URL;

export const ModalDeleteProduct = ({ onRemoveProduct }) => {

    const { showModalDeleteBook, closeModalDeleteBook, dataBook } = useModal();

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Aquí iría la lógica para agregar la tarjeta
        console.log('Formulario enviado:');

        try {
            // Cambia la URL a la de tu API
            const response = await axios.delete(`http://saf1.${apiUrl}.nip.io/gom2/api/products/`+dataBook.Id_producto);

            // Manejo de la respuesta
            console.log("Respuesta del servidor:", response.data);
            onRemoveProduct(dataBook.Id_producto, "Producto eliminado")
            // Aquí podrías hacer algo con la respuesta, como cerrar el modal, limpiar el formulario, etc.
        } catch (error) {
            // Manejo de errores
            console.error("Hubo un error al enviar el formulario:", error);
        }
        // Cerrar el modal después de enviar
        closeModalDeleteBook();
    };

    return (
        <>
        {showModalDeleteBook ? (
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Eliminar Producto</DialogTitle>
                <Typography style={{padding: '10px'}} variant="subtitle1" component="div">
                Esta seguro de eliminar el producto? 
                </Typography>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                    

                        <DialogActions>
                            <Button onClick={closeModalDeleteBook} color="secondary">
                                Cancelar
                            </Button>
                            <Button type="submit" color="primary">
                                Eliminar
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        ) : null }
        </>
    )

    
}