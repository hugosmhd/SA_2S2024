import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, CardMedia, Typography, Button, CardActions, TextField, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 30px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#007BFF',
  color: '#fff',
  borderRadius: '12px',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#0056b3',
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  borderRadius: '12px',
  height: '200px',
  objectFit: 'cover',
  backgroundColor: '#f0f0f0',
}));

const ProductListClient = () => {
  const [categories, setCategories] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [currency, setCurrency] = useState('Q');
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, MXN: 1, JPY: 1 });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCategories();
    fetchExchangeRates();
  }, [token]);

  const fetchCategories = () => {
    axios
      .get('http://saf1.35.192.41.172.nip.io/gom2/api/products-category')
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener los productos:', error);
      });
  };

  const fetchExchangeRates = () => {
    const currencies = { USD: 2, MXN: 18, JPY: 3 };
    const promises = Object.entries(currencies).map(([key, id]) =>
      axios
        .get(`http://saf1.35.192.41.172.nip.io/gom5/convertir?id=${id}&cantidad=1`)
        .then((response) => ({ [key]: response.data.conversion }))
    );

    Promise.all(promises)
      .then((results) => {
        const rates = results.reduce((acc, rate) => ({ ...acc, ...rate }), {});
        setExchangeRates(rates);
      })
      .catch((error) => {
        console.error('Error al obtener las tasas de cambio:', error);
      });
  };

  const handleAddToCart = (productId) => {
    const quantity = selectedQuantities[productId] || 1;

    axios
      .post(
        'http://saf1.35.192.41.172.nip.io/pythonm3/auth/cart/add',
        { id_producto: productId, cantidad: quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        alert('Producto añadido al carrito con éxito');
      })
      .catch((error) => {
        console.error('Error al añadir el producto al carrito:', error);
        alert('Error al añadir el producto al carrito');
      });
  };

  const handleQuantityChange = (productId, value) => {
    setSelectedQuantities({
      ...selectedQuantities,
      [productId]: parseInt(value) || 1,
    });
  };

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  const convertPrice = (price) => {
    if (currency === 'Q') return price;
    const rate = exchangeRates[currency] || 1;
    return (price / rate).toFixed(2);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel id="currency-label">Moneda</InputLabel>
        <Select
          labelId="currency-label"
          value={currency}
          onChange={handleCurrencyChange}
          label="Moneda"
        >
          <MenuItem value="Q">Quetzales (Q)</MenuItem>
          <MenuItem value="USD">Dólares (USD)</MenuItem>
          <MenuItem value="MXN">Pesos Mexicanos (MXN)</MenuItem>
          <MenuItem value="JPY">Yenes (JPY)</MenuItem>
        </Select>
      </FormControl>

      {categories.map((category) => (
        category.Products.length > 0 ? (
          <div key={category.CategoryID} style={{ marginBottom: '40px' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
              {category.nombre_categoria}
            </Typography>
            <Grid container spacing={4}>
              {category.Products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id_producto}>
                  <StyledCard>
                    <StyledCardMedia
                      component="img"
                      image={product.imagen_producto || 'https://via.placeholder.com/150'}
                      alt={product.nombre_producto}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
                        {product.nombre_producto}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                        Precio: {product.precio ? `${currency} ${convertPrice(product.precio)}` : 'No disponible'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                        Disponibles: {product.stock}
                      </Typography>
                      <TextField
                        label="Cantidad"
                        type="number"
                        value={selectedQuantities[product.Id_producto] || 1}
                        onChange={(e) => handleQuantityChange(product.Id_producto, e.target.value)}
                        inputProps={{ min: 1, max: product.stock }}
                        fullWidth
                        sx={{ mt: 2, mb: 2 }}
                      />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                      <StyledButton
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddToCart(product.Id_producto)}
                      >
                        Añadir al carrito
                      </StyledButton>
                    </CardActions>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </div>
        ) : null
      ))}
    </Box>
  );
};

export default ProductListClient;
