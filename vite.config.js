import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        blog: './blog.html'
      }
    }
  },
  server: {
    port: 3000
  }
})