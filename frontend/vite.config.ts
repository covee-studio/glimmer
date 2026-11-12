import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { stubAnalyticsConfig } from "./configs/stubAnalyticsConfig";
// Avoid Node path usage to keep TS build simple

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    stubAnalyticsConfig(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
        manifest: {
        name: "Glimmer",
        short_name: "Glimmer",
        icons: [
          {
              src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  define: {
    __IS_EXTENSION__: JSON.stringify(false),
  },
});
