import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Permite escuchar en 0.0.0.0
    port: 3000,  // Configura el puerto (asegúrate de que coincida con el que expones en Docker)
  },
})