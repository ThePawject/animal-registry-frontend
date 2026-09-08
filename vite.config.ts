import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    devtools(),
    tailwindcss(),
    viteReact(),
  ],
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
  },
})

export default config
