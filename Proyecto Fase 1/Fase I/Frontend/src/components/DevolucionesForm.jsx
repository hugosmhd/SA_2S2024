import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Checkbox, FormControlLabel, Typography, Grid } from '@mui/material';

const DevolucionesForm = ({ open, onClose, idCliente, idVenta, productosDisponibles, onDevolucionSubmit }) => {
  const [productosSeleccionados, setProductosSeleccionados] = useState({});

  // Manejar el cambio de estado de los checkboxes
  const handleCheckboxChange = (idProducto) => {
    setProductosSeleccionados((prev) => {
      const newSelection = { ...prev };
      if (newSelection[idProducto]) {
        delete newSelection[idProducto];
      } else {
        newSelection[idProducto] = true;
      }
      return newSelection;
    });
  };

  // Manejar el envío del formulario de devolución
  const handleSubmit = () => {
    // Filtrar los productos seleccionados
    const productosADevolver = productosDisponibles.filter((producto) =>
      productosSeleccionados[producto.id_producto]
    );

    if (productosADevolver.length === 0) {
      alert('Debes seleccionar al menos un producto para devolver.');
      return;
    }

    // Llamar a la función onDevolucionSubmit para procesar la devolución
    onDevolucionSubmit(idCliente, idVenta, productosADevolver);
    onClose(); // Cerrar el modal
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Solicitar Devolución</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Selecciona los productos que deseas devolver:
        </Typography>
        <Grid container spacing={2}>
          {productosDisponibles.map((producto) => (
            <Grid item xs={12} sm={6} md={4} key={producto.id_producto}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={productosSeleccionados[producto.id_producto] || false}
                    onChange={() => handleCheckboxChange(producto.id_producto)}
                    name={`producto-${producto.id_producto}`}
                  />
                }
                label={`${producto.nombre_producto} - Q${parseFloat(producto.precio).toFixed(2)}`}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary">Solicitar Devolución</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DevolucionesForm;