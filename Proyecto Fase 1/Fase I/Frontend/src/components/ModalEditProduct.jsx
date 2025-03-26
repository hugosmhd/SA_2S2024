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

export const ModalEditProduct = ({ onEditProduct }) => {

    const { showModalUpdateBook, closeModalUpdateBook, dataBook } = useModal();


    const [formData, setFormData] = useState({
        nombre_producto: '',
        precio: 0,
        stock: 0,
        Image: '',
    });

    const fetchData = async () => {

        // const respuesta = await getAuthors();
        // setAutores(respuesta);


    //     axios
    //   .get('http://127.0.0.1:3001/api/products')
    //   .then((response) => {
    //     setProducts(response.data);
    //     console.log(response.data);
        
    //   })
    //   .catch((error) => {
    //     console.error('Error al obtener los productos:', error);
    //   });

    }

    useEffect(() => {
        // console.log('Hola');
        setFormData(dataBook ? dataBook : {
            nombre_producto: '',
            precio: 0,
            stock: 0,
            Image: '',
        })
        fetchData();
        // setAutorText(dataBook?.autor)
        // setFoto(dataBook?.imagen_url)


    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleInputChangeNumeric = (e) => {
        const { name, value } = e.target;
    
        // Convertir el valor a número usando parseFloat, o usar +value para obtener un número
        const numericValue = value === "" ? "" : parseFloat(value);
    
        setFormData((prevData) => ({
            ...prevData,
            [name]: numericValue,
        }));
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Aquí iría la lógica para agregar la tarjeta
        console.log('Formulario enviado:', formData);
        const newData = {
            precio: formData.precio,
            stock: formData.stock
        }
        try {
            // Cambia la URL a la de tu API
            const response = await axios.put(`http://saf1.${apiUrl}.nip.io/gom2/api/products/`+formData.Id_producto, newData);

            // Manejo de la respuesta
            console.log("Respuesta del servidor:", response.data);
            onEditProduct(response.data, "Producto agregado")
            // Aquí podrías hacer algo con la respuesta, como cerrar el modal, limpiar el formulario, etc.
        } catch (error) {
            // Manejo de errores
            console.error("Hubo un error al enviar el formulario:", error);
        }
        // Cerrar el modal después de enviar
        closeModalUpdateBook();
    };

    return (
        <>
        {showModalUpdateBook ? (
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Editar Producto</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <TextField
                                fullWidth
                                label="Nombre del producto"
                                variant="outlined"
                                name="nombre_producto"
                                value={formData.nombre_producto}
                                onChange={handleInputChange}
                                style={{ marginBottom: '16px', marginTop: '15px' }}
                            />
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                type="number"
                                label="Precio de venta"
                                variant="outlined"
                                name="precio"
                                value={formData.precio}
                                onChange={handleInputChangeNumeric}
                                style={{ marginBottom: '16px' }}
                            />
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                type="number"
                                label="Stock"
                                variant="outlined"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChangeNumeric}
                                style={{ marginBottom: '16px' }}
                            />
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                label="Image"
                                variant="outlined"
                                name="imagen_producto"
                                value={formData.imagen_producto}
                                onChange={handleInputChange}
                                style={{ marginBottom: '16px' }}
                            />
                        </div>
                        <DialogActions>
                            <Button onClick={closeModalUpdateBook} color="secondary">
                                Cancelar
                            </Button>
                            <Button type="submit" color="primary">
                                Actualizar
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        ) : null }
        </>
    )

    
}