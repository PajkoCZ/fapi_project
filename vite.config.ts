// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'
import { configDefaults } from 'vitest/config'

const config: UserConfig = {
  plugins: [react()],
  test: {
    environment: 'jsdom',  // 👈 musí být jsdom
    globals: true,          // expect() bez importu
    setupFiles: './src/tests/setupTests.ts',
    // exclude: [...configDefaults.exclude], // volitelné
  },
}

export default defineConfig(config)
