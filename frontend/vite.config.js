import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy only applies in local dev (npm run dev).
    // In production (Netlify), VITE_API_URL env var points directly to AWS backend.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui:    ["@mui/material", "@mui/icons-material"],
        },
      },
    },
  },
});
