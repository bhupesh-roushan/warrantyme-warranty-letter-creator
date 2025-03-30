import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: "0.0.0.0", // Ensure the app is accessible externally
    port: process.env.PORT || 5173, // Use Render's assigned port
    strictPort: true,
    allowedHosts: ["warrantyme-warranty-letter-creator-f2.onrender.com"],
  },
})
