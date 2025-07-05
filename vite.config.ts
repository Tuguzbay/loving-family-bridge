
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only use lovable-tagger in development mode and when available
    mode === 'development' && (() => {
      try {
        const { componentTagger } = require('lovable-tagger');
        return componentTagger();
      } catch (e) {
        // lovable-tagger not available in local environment
        return null;
      }
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
