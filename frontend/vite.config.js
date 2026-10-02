import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // server: {
  //   host: "127.0.0.1",
  //   port: 5160,
  // },

  build: {
    chunkSizeWarningLimit: 2000,
    outDir: "dist",
  },

  base: "/",
});
