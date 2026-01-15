import { defineConfig } from 'vite'


export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: './index.html',
        changelog: './changelog.html',
      }
    }
  },
  base: './',
})