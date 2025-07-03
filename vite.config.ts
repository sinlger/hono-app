import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'

export default defineConfig({
  plugins: [cloudflare({
    d1Databases: ['DB'],
    wranglerConfigPath: './wrangler.jsonc'
  }), ssrPlugin()]
})
