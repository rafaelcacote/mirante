import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [tailwindcss(), vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0', // Permite acesso de qualquer IP na rede local
      port: 5173, // Porta padrão do Vite
      strictPort: false, // Se a porta estiver ocupada, tenta outra
      proxy: {
        // Proxy para API Laravel intermediaria (contorna CORS)
        // Cobre todas as rotas: /api/events, /api/operadores, /api/clientes, /api/checkout, etc.
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
