import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_DEV_API_PROXY || 'http://localhost:5050';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5180,
      strictPort: true,
      host: true, // reachable from a phone on the same Wi-Fi for real QR testing
      proxy: { '/api': { target: apiTarget, changeOrigin: true } },
    },
    preview: {
      port: 5180,
      host: true,
      proxy: { '/api': { target: apiTarget, changeOrigin: true } },
    },
  };
});
