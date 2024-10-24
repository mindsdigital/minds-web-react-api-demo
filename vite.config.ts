import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
const url = "https://sandbox-voice-api.minds.digital";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis"
    
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    proxy: {
      "/api": {
        target: url,
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
    cors: false,
  },
  		preview: {
    proxy: {
      "/api": {
        target: url,
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
    cors: false,
  },
});
