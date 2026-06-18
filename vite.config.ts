import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "favicon-32x32.png"],
      manifest: {
        name: "AMILO AGD — magazyn",
        short_name: "AMILO AGD",
        description: "Magazyn używanego sprzętu AGD",
        lang: "pl",
        theme_color: "#0d0d0d",
        background_color: "#0d0d0d",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // NBP API: sieć w pierwszej kolejności, z fallbackiem do cache
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === "api.nbp.pl",
            handler: "NetworkFirst",
            options: {
              cacheName: "nbp-rates",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
