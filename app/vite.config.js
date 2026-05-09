import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Config: Vite proxy intercepts any request to React app that starts with /api and forwards to Express backend
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});