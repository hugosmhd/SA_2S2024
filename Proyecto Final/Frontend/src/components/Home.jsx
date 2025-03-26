import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#232f3e' }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: '#ff9900',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            EconoMarket
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ marginRight: 1 }}
          >
            Iniciar Sesión
          </Button>
          <Button
            color="inherit"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/register')}
          >
            Registrarse
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1c1c1c 100%)',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container>
          <Box sx={{ marginBottom: 4 }}>
            <LocalShippingIcon sx={{ fontSize: 80, color: '#ff9900' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            Bienvenido a EconoMarket
          </Typography>
          <Typography variant="h6" sx={{ marginBottom: 4 }}>
            Compra desde la comodidad de tu hogar, directo del proveedor. Calidad y confianza en un solo lugar.
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#ff9900',
              color: 'white',
              '&:hover': { backgroundColor: '#cc7a00' },
            }}
            onClick={() => navigate('/register')}
          >
            Comienza Ahora
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ marginTop: 6, marginBottom: 6 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 4 }}>
          ¿Por qué elegirnos?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: '#f7f7f7',
                padding: 3,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <LocalShippingIcon sx={{ fontSize: 50, marginBottom: '10px', color: '#ff9900' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#232f3e', marginBottom: 1 }}>
                Envío Rápido
              </Typography>
              <Typography variant="body2" sx={{ color: '#232f3e' }}>
                Recibe tus productos rápidamente y sin complicaciones.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: '#f7f7f7',
                padding: 3,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <SecurityIcon sx={{ fontSize: 50, marginBottom: '10px', color: '#ff9900' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#232f3e', marginBottom: 1 }}>
                Pagos Seguros
              </Typography>
              <Typography variant="body2" sx={{ color: '#232f3e' }}>
                Compra con total seguridad y confianza en nuestra plataforma.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: '#f7f7f7',
                padding: 3,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 50, marginBottom: '10px', color: '#ff9900' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#232f3e', marginBottom: 1 }}>
                Atención al Cliente
              </Typography>
              <Typography variant="body2" sx={{ color: '#232f3e' }}>
                Estamos aquí para ayudarte en cualquier momento.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#232f3e', color: 'white', padding: 4, textAlign: 'center' }}>
        <Typography variant="body1">© 2024 EconoMarket - Todos los derechos reservados.</Typography>
      </Box>
    </>
  );
};

export default Home;
