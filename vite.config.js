import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "SyP App",
        short_name: "SyP",
        start_url: "/",
        display: "standalone",
        background_color: "#333446",
        icons: [
          { src: "icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '~composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '~views': fileURLToPath(new URL('./src/views', import.meta.url)),
    },
  },
})
