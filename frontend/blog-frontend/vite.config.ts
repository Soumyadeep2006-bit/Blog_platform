import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],

  server: {
    // 1. Force Vite to listen on your local network, not just localhost
    host: true, 
    
    // 2. Set a fixed port so you don't have to guess what ngrok should target
    port: 5173, 
    
    // 3. CRITICAL: Tells Vite to accept incoming traffic from ngrok domains
    // Without this, you will get an "Invalid Host header" or a 403 error in your mobile browser.
    allowedHosts: ["flameproof-concentrative-jordy.ngrok-free.dev"]
  }
})
