import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Project page served at https://<user>.github.io/coin-keep/ — must match the repo name.
export default defineConfig({
  base: '/coin-keep/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
