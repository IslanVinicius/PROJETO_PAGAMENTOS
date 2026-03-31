import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite acesso externo
    port: 5173,
    strictPort: true,
    allowedHosts: true // Permite qualquer host na rede
  }
})
