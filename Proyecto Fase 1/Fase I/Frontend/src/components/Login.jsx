import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert, CircularProgress, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      // Verificar si las credenciales son admin/admin
      if (email === 'admin' && password === 'admin') {
        navigate('/admin'); // Redirige al panel de administración
        setLoading(false);
        return;
      }
      // Inicia sesión y obtiene el token
      const response = await axios.post(`http://saf1.${apiUrl}.nip.io/pythonm1/auth/login`, {
        email,
        contrasena: password,
      });

      if (response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);

        // Solicita información del usuario usando el token
        const profileResponse = await axios.get(`http://saf1.${apiUrl}.nip.io/pythonm1/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = profileResponse.data.user;

        // Redirige según el tipo de usuario
        if (user.tipo_usuario === 'Cliente') {
          navigate('/dash-cliente');
        } else if (user.tipo_usuario === 'Proveedor') {
          navigate('/dash-proveedor');
        }else if (user.tipo_usuario === 'Admin') {
          navigate('/admin');
        } else {
          setMessage('Tipo de usuario no reconocido');
        }

        setLoading(false);
      } else {
        setMessage('Error: Credenciales inválidas');
        setLoading(false);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
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

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            padding: 4,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: 'white',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#232f3e', textAlign: 'center' }}
          >
            Iniciar Sesión
          </Typography>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                backgroundColor: '#ff9900',
                color: 'white',
                '&:hover': { backgroundColor: '#cc7a00' },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
          </form>
          {message && (
            <Alert
              severity={message.includes('exitoso') ? 'success' : 'error'}
              sx={{
                mt: 2,
                backgroundColor: message.includes('exitoso') ? '#e6f4ea' : '#fbeaea',
              }}
            >
              {message}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#232f3e', color: 'white', padding: 2, textAlign: 'center' }}>
        <Typography variant="body1">© 2024 EconoMarket - Todos los derechos reservados.</Typography>
      </Box>
    </Box>
  );
};

export default Login;
