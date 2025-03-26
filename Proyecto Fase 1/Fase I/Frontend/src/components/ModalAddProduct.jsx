import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import { useModal } from './context/ModalContext'

const apiUrl = import.meta.env.VITE_API_URL;

export const ModalAddProduct = ({ onNewProduct }) => {

    const token = localStorage.getItem('token');  

    const { showModal, closeModal } = useModal();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
          try {
            const response = await axios.get(`http://saf1.${apiUrl}.nip.io/gom2/api/categories`);
            console.log(response.data);
            
            setCategories(response.data);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching categories', error);
            setLoading(false);
          }
        };

        setFormData((prevData) => ({
            ...prevData,
        }));
    
        fetchCategories();
    }, []);

    const handleChangeCategory = (e) => {
        const { name, value } = e.target;
        setSelectedCategory(value);

        const numericValue = value === "" ? "" : parseFloat(value);
    
        setFormData((prevData) => ({
            ...prevData,
            [name]: numericValue,
        }));
      };


    const [formData, setFormData] = useState({
        ProductName: '',
        SalePrice: 0,
        Stock: 0,
        Image: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleInputChangeNumeric = (e) => {
        const { name, value } = e.target;
    
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
        
        console.log('Formulario enviado:', formData);
        try {
            const response = await axios.post(`http://saf1.${apiUrl}.nip.io/gom2/api/products`, 
                formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`  // Agregar el token en el encabezado Authorization
                    }
                });

            console.log("Respuesta del servidor:", response.data);
            onNewProduct(response.data, "Producto agregado")
        } catch (error) {
            console.error("Hubo un error al enviar el formulario:", error);
        }
        closeModal();
    };

    return (
        <>
        {showModal ? (
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Agregar Producto</DialogTitle>
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
                        <FormControl fullWidth>
                            <InputLabel id="category-label">Categoria</InputLabel>
                            <Select
                            value={selectedCategory}
                            label="Categoria"
                            name="Id_categoria"
                            onChange={handleChangeCategory}
                            disabled={loading}
                            style={{ marginBottom: '16px' }}
                            >
                            {loading ? (
                                <MenuItem disabled>
                                <CircularProgress size={24} />
                                </MenuItem>
                            ) : (
                                categories.map((category) => (
                                <MenuItem key={category.Id_categoria} value={category.Id_categoria}>
                                    {category.nombre_categoria}
                                </MenuItem>
                                ))
                            )}
                            </Select>
                        </FormControl>
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                label="Imagen"
                                variant="outlined"
                                name="imagen_producto"
                                value={formData.imagen_producto}
                                onChange={handleInputChange}
                                style={{ marginBottom: '16px' }}
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
        ) : null }
        </>
    )

    
}