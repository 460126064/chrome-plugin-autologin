import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    polyfillModulePreload: false,
    rollupOptions: {
      input: {
        background: './background.html',
        popup: './popup.html',
        options: './options.html',
        content: './src/content.ts',
        inject: './src/inject.ts'
      },
      output: [{
        format: 'module',
        entryFileNames: 'static/js/[name].js',
        chunkFileNames: 'static/js/[name].js',
        assetFileNames: 'static/[ext]/name-[hash].[ext]'
      }]
    }
  }
})
