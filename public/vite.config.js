import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default {
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
}

