import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link } from 'react-router-dom';

const NavbarAdmin = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Mi Tienda
        </Typography>
        <Button color="inherit" component={Link} to="/cupones">
          Cupones
        </Button>
        <Button color="inherit" component={Link} to="/listado-devoluciones">
          Devoluciones
        </Button>
        <Button color="inherit" component={Link} to="/">
          Cerrar Sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarAdmin;
