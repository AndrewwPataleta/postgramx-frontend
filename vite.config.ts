import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8081,
    fs: {
      allow: [".", "./client", "./client/src"],
      deny: [".env.local", ".env.local.*", "*.{crt,pem}", "**/.git/**"],
    },
  },
  preview: {
    allowedHosts: "all",
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@app": path.resolve(__dirname, "./client/src/app"),
      "@shared": path.resolve(__dirname, "./client/src/shared"),
      "@entities": path.resolve(__dirname, "./client/src/entities"),
      "@features": path.resolve(__dirname, "./client/src/features"),
      "@pages": path.resolve(__dirname, "./client/src/pages"),
    },
  },
}));
