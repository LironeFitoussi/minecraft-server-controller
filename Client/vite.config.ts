import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const backendTarget = process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Proxy error:', err.message);
          });
        },
      },
      '/danger': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        timeout: 30000,
      },
    },
  },
})