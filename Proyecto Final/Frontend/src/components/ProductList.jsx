import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, CardMedia, Typography, Button, CardActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { useModal } from "./context/ModalContext";
import { ModalAddProduct } from "./ModalAddProduct";
import { ModalEditProduct } from "./ModalEditProduct";
import { ModalDeleteProduct } from "./ModalDeleteProduct";



const ProductList = () => {

  const { openModal,
    showModal,
    openModalUpdatedBook,
    showModalUpdateBook,
    openModalDeletedBook,
    showModalDeleteBook
  } = useModal();

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
      .get('http://saf1.35.192.41.172.nip.io/gom2/api/products-provider', {
        headers: {
          'Authorization': `Bearer ${token}`  // Agregar el token en el encabezado Authorization
        }
      })
      .then((response) => {
        console.log(response.data);
        setProducts(response.data);
        
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

  const onAddProduct = (newBook, respuesta) => {
    setProducts([...products, newBook]);

    // if (respuesta.message) {
    //   notifySuccess(respuesta.message);
    // } else if (respuesta.error) {
    //   notifyError(respuesta.error);
    // } else {
    //   notifyError("Error interno en el servidor");
    // }
  }

  const onUpdateProduct = (newProduct, respuesta) => {
    setProducts(products.map(product => (product.Id_producto === newProduct.Id_producto ? newProduct : product)));
    // if (respuesta.message) {
    //   notifySuccess(respuesta.message);
    // } else if (respuesta.error) {
    //   notifyError(respuesta.error);
    // } else {
    //   notifyError("Error interno en el servidor");
    // }
  }

  const onDeleteProduct = (bookId, respuesta) => {
    setProducts(products.filter(product => product.Id_producto !== bookId));

    // if (respuesta.message) {
    //   notifySuccess(respuesta.message);
    // } else if (respuesta.error) {
    //   notifyError(respuesta.error);
    // } else {
    //   notifyError("Error interno en el servidor");
    // }
  }

  return (
    <div>

      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.Id_producto}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.imagen_producto || 'https://via.placeholder.com/150'}
                alt={product.nombre_producto}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.nombre_producto}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Precio: {product.precio ? `Q${product.precio.toFixed(2)}` : 'No disponible'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Disponibles: {product.stock}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categoria: {product.Category.nombre_categoria}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={(e) => openModalUpdatedBook(product)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => openModalDeletedBook(product)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <div className="floating-button">
        <button
          type="button"
          onClick={(e) => {
            openModal(e)
            console.log("Abrir modal");
          }}
        >
          <AddIcon />
        </button>
      </div>

      <ModalAddProduct
        onNewProduct={(value, respuesta) => onAddProduct(value, respuesta)}
      />

      <ModalDeleteProduct
        onRemoveProduct={(value, respuesta) => onDeleteProduct(value, respuesta)}
      />

      {
        showModalUpdateBook ?
      <ModalEditProduct
        onEditProduct={(value, respuesta) => onUpdateProduct(value, respuesta)}
      /> : null
      }
    </div>
  );
};

export default ProductList;
