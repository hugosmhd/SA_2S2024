import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, CardMedia, Typography, Button, CardActions, TextField } from '@mui/material';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});  
  
  const token = localStorage.getItem('token');  
  const userId = localStorage.getItem('userId');  
  
  useEffect(() => {
    fetchProducts();
  }, [token]);

  
  const fetchProducts = () => {

    // Esto va en el get
    // , {
    //   headers: {
    //     Authorization: `Bearer ${token}`, 
    //   },
    // }

    // const pro = [
    //   {
    //     imagen: 'https://tecnologia-informatica.com/wp-content/uploads/2018/07/funciones-de-la-computadora-1.jpeg',
    //     price: 150,
    //     name: 'Computadora',
    //     quantity: 12
    //   },
    //   {
    //     imagen: 'https://walmartgt.vtexassets.com/arquivos/ids/298519/Telefono-Celular-Samsung-A525-128Gb-2-42257.jpg?v=637980105988200000',
    //     price: 150,
    //     name: 'Computadora',
    //     quantity: 12
    //   },
    //   {
    //     imagen: 'https://electronicapanamericana.com/wp-content/uploads/large01-1-1030x684.jpg',
    //     price: 150,
    //     name: 'Computadora',
    //     quantity: 12
    //   },
    //   {
    //     imagen: 'https://cdn.mos.cms.futurecdn.net/FkGweMeB7hdPgaSFQdgsfj-1200-80.jpg',
    //     price: 150,
    //     name: 'Computadora',
    //     quantity: 12
    //   },
    // ]
    // setProducts(pro);
    axios
      .get('http://127.0.0.1:3000/api/products')
      .then((response) => {
        setProducts(response.data);
        console.log(response.data);
        
      })
      .catch((error) => {
        console.error('Error al obtener los productos:', error);
      });
  };
  const handleSyncProducts = () => {
    const currentToken = localStorage.getItem('token'); 
    console.log("Token almacenado:", currentToken);  
    
    axios
      .get('http://34.56.73.111:5000/auth/productos', {
        headers: {
          Authorization: `Bearer ${currentToken}`,  
        },
      })
      .then((response) => {
        alert('Productos sincronizados correctamente');
        fetchProducts();  
      })
      .catch((error) => {
        console.error('Error al sincronizar los productos:', error);
        alert('Error al sincronizar los productos, vuelva a iniciar sesión');
      });
  };
  
  const handleAddToCart = (productId) => {
    const quantity = selectedQuantities[productId] || 1;

    axios
      .post(
        'http://34.56.73.111:5000/cart/add', 
        { user_id: userId, product_id: productId, quantity: quantity },
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
      [productId]: parseInt(value) || 1
    });
  };

  return (
    <div>
      <Button
        size="small"
        variant="contained"
        color="secondary"
        onClick={handleSyncProducts}
        sx={{ mb: 2 }}
      >
        Sincronizar Productos
      </Button>

      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.ProductID}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.Image || 'https://via.placeholder.com/150'}
                alt={product.ProductName}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.ProductName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Precio: {product.SalePrice ? `Q${product.SalePrice.toFixed(2)}` : 'No disponible'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Disponibles: {product.Stock}
                </Typography>
                <TextField
                  label="Cantidad"
                  type="number"
                  InputProps={{ inputProps: { min: 1, max: product.Stock } }}
                  variant="outlined"
                  size="small"
                  value={selectedQuantities[product.id] || 1}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  sx={{ mt: 2, mb: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddToCart(product.id)}
                >
                  Añadir al carrito
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ProductList;
