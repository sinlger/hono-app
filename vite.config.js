import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';
import ngrok from '@ngrok/ngrok';
import dotenv from 'dotenv';

dotenv.config();

// Function to setup ngrok and log the URL
export default defineConfig({
  server: {
    allowedHosts: ['.ngrok-free.app'],
  },
  plugins: [
    cloudflare({
      d1Databases: ['DB'],
      wranglerConfigPath: './wrangler.toml'
    }),
    {
      name: 'ngrok-setup',
      configureServer(server) {
        server.httpServer.once('listening', async () => {
          try {
            const addr = server.httpServer.address()
            if (addr && typeof addr === 'object') {
              const listener = await ngrok.connect({
                addr: addr.port,
                authtoken: process.env.NGROK_AUTHTOKEN,
              })
              console.log(`Ingress established at: ${listener.url()}`)
            } else {
               console.error('Could not get server address to start ngrok.')
            }
          } catch (e) {
            console.error('ngrok failed to start:', e)
          }
        })
      },
    },
  ],
})
