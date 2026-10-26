import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteSingleFile()
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
    allowedHosts: true
  },
  preview: {
    host: '127.0.0.1',
    port: 8080,
    strictPort: false,
    allowedHosts: true
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 10000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      }
    }
  }
});
