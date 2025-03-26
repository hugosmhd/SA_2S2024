import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ProductList from './ProductList';
import api from '../services/axiosConfig2'; // Usa el interceptor configurado

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Si no hay token, redirigir al inicio de sesión
        // navigate('/login');
        return;
      }

      try {
        // Verificar el token con una solicitud protegida
        const response = await api.get('/jwtready');
        console.log('Usuario autenticado:', response.data);
      } catch (error) {
        console.error('Token inválido o expirado:', error.response?.data || error.message);
        localStorage.removeItem('token'); // Eliminar token inválido
        navigate('/login'); // Redirigir al login
      }
    };

    verificarToken();
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <ProductList />
    </div>
  );

};

export default Dashboard;
