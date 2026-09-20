import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Домейните, през които сайтът се отваря отвън (ngrok и подобни тунели).
 * Водещата точка означава „този домейн и всички негови поддомейни“, така че
 * новият случаен адрес на ngrok при всяко пускане работи без промяна тук.
 */
const TUNNEL_HOSTS = [
  '.ngrok-free.dev',
  '.ngrok-free.app',
  '.ngrok.app',
  '.ngrok.io',
  '.ngrok.dev',
  '.trycloudflare.com',
  '.loca.lt',
  '.serveo.net',
];

export default defineConfig({
  plugins: [react()],
  server: {
    // слуша на всички интерфейси, за да се вижда и от телефон в същата мрежа
    host: true,
    port: 5173,
    open: true,
    allowedHosts: TUNNEL_HOSTS,
    hmr: {
      // през HTTPS тунел живият презареждач върви по wss на стандартния порт
      clientPort: process.env.VITE_TUNNEL ? 443 : undefined,
      protocol: process.env.VITE_TUNNEL ? 'wss' : undefined,
    },
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: TUNNEL_HOSTS,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
