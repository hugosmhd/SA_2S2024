import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, Divider } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const PurchaseReport = () => {
  const [reportData, setReportData] = useState([]);
  const token = localStorage.getItem('token');  

  useEffect(() => {

    axios
      .get('http://34.56.73.111:5000/report/purchases', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setReportData(response.data);  
      })
      .catch((error) => {
        console.error('Error al obtener el reporte de compras:', error);
      });
  }, [token]);

  return (
    <div>

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mi Tienda
          </Typography>
          <Button color="inherit" href="/dash">
            Productos
          </Button>
          <Button color="inherit" href="/cart" startIcon={<ShoppingCartIcon />}>
            Carrito
          </Button>
          <Button color="inherit" href="/report">
            Reporte de Compras
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Reporte de Compras
        </Typography>

        {reportData.length > 0 ? (
          <Grid container spacing={3}>
            {reportData.map((purchase, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Cliente: {purchase.cliente}</Typography>
                    <Typography variant="body1">
                      Fecha de Compra: {purchase.fecha_compra}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">
                      <strong>Producto:</strong> {purchase.producto.nombre}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Cantidad:</strong> {purchase.producto.cantidad}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Precio Unitario:</strong> Q{purchase.producto.precio.toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Total:</strong> Q{(purchase.producto.precio * purchase.producto.cantidad).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" align="center">
            No se han registrado compras.
          </Typography>
        )}
      </Container>
    </div>
  );
};

export default PurchaseReport;
