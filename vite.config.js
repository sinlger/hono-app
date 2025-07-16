import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [cloudflare({
    d1Databases: ['DB'],
    wranglerConfigPath: './wrangler.toml'
  })]
})
