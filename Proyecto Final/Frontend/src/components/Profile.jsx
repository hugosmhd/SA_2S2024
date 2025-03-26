import React, { useState, useEffect } from 'react';
import axios from '../services/axiosConfig2';
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import Navbar from './Navbar';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [editing, setEditing] = useState(false); // Modo edición
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null); // Archivo de fotografía

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/profile');
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    // Agregar datos al FormData
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (file) {
      formData.append('fotografia', file);
    }

    try {
      const response = await axios.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUserData(response.data.user); // Actualizar los datos con los nuevos valores
      setMessage('Perfil actualizado con éxito');
      setEditing(false);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 4,
            padding: 3,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            Perfil del Usuario
          </Typography>

          {userData.fotografia ? (
            <Avatar
              src={userData.fotografia}
              alt={userData.nombres}
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                border: '2px solid #1976d2',
                boxShadow: 3,
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                backgroundColor: '#1976d2',
                color: 'white',
                fontSize: 48,
              }}
            >
              {userData.nombres?.charAt(0) || '?'}
            </Avatar>
          )}

          {!editing ? (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                {userData.nombres} {userData.apellidos}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Email: {userData.email}
              </Typography>
              <Typography variant="body1">Dirección: {userData.direccion}</Typography>
              <Typography variant="body1">Celular: {userData.celular}</Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => setEditing(true)}
              >
                Editar Perfil
              </Button>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <TextField
                fullWidth
                margin="normal"
                label="Nombres"
                name="nombres"
                value={userData.nombres || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Apellidos"
                name="apellidos"
                value={userData.apellidos || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={userData.email || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Dirección"
                name="direccion"
                value={userData.direccion || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Celular"
                name="celular"
                value={userData.celular || ''}
                onChange={handleInputChange}
              />
              <Button
                variant="contained"
                component="label"
                sx={{ mt: 2 }}
              >
                Subir Fotografía
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
              </Box>
            </form>
          )}

          {message && (
            <Alert severity={message.includes('éxito') ? 'success' : 'error'} sx={{ mt: 3 }}>
              {message}
            </Alert>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Profile;
