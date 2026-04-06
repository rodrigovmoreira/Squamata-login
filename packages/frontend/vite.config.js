import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Porta dedicada para o Squamata-login
    strictPort: true, // Trava o Vite nessa porta. Se estiver ocupada, ele dá erro em vez de pular para 5175.
    host: true // O mesmo que '0.0.0.0'. Permite que você acesse via celular ou outro PC na mesma rede.
  }
})