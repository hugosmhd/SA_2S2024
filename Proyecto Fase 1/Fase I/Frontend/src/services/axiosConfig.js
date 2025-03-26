import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: `http://saf1.${apiUrl}.nip.io/pythonm3/auth/`,
});

// Interceptor para incluir el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("estoy voy a mandar: " + token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Token expirado o inválido. Redirigiendo al login...');
      localStorage.removeItem('token'); // Eliminar token
      window.location.href = '/';  // Redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
