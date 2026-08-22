import { defineConfig } from 'vite'


export default defineConfig({
  optimizeDeps: {
    rolldownOptions: {
       transform: {
        target: 'esnext',
      },
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