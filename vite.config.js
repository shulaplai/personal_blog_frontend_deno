import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { supabaseAdapter } from './vite-plugin-supabase.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Translates Laravel-style /api/* requests to the Supabase backend
      // (PostgREST views for reads, Edge Functions for writes/auth).
      supabaseAdapter({
        target: env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
        anonKey: env.VITE_SUPABASE_ANON_KEY,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@mui/')) return 'mui';
            if (id.includes('node_modules/@tiptap/')) return 'tiptap';
            if (id.includes('node_modules/@reduxjs/') || id.includes('node_modules/react-redux')) return 'redux';
          },
        },
      },
    },
  };
});
