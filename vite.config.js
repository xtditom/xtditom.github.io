import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".",
  base: "/",
  publicDir: "public",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "index.html",
        ydd: "ydd/index.html",
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});

