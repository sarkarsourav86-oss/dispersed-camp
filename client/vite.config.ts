import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'DispersedCamp - Find Free Camping',
        short_name: 'DispersedCamp',
        description: 'Find BLM and National Forest dispersed camping near you',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#1c1917',
        theme_color: '#d97706',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        globIgnores: ['**/van.webp', '**/logo.webp'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 2000, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/[abc]\.tile\.opentopomap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'topo-tiles',
              expiration: { maxEntries: 1000, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-data',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/spots.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'spot-data',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 15,
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/land.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'land-data',
              expiration: { maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/routing.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'routing-data',
              expiration: { maxEntries: 200, maxAgeSeconds: 6 * 60 * 60 },
            },
          },
          {
            urlPattern: /\/data\/ioverlander\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ioverlander-data',
              expiration: { maxEntries: 1200, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5227',
        changeOrigin: true,
      },
    },
  },
})
