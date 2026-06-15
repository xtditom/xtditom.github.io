import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "/",
  publicDir: "public",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: false,
  },
});
