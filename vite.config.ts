import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Deployed to GitHub Pages under /allotmentapp/
export default defineConfig({
  base: '/allotmentapp/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        navigateFallback: '/allotmentapp/index.html',
        // Weather responses are cached by the app itself; never let the SW
        // hold the map hostage to the network.
        runtimeCaching: [],
      },
      manifest: {
        name: 'Plot 47',
        short_name: 'Plot 47',
        description: "Alderman Moore's · Plot 47 — a working garden plan",
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/allotmentapp/',
        scope: '/allotmentapp/',
        background_color: '#f5f0e4',
        theme_color: '#f5f0e4',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
