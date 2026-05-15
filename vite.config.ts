import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": path.join(__dirname, "src")
      }
    },
    server: {
      port: 3001,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE || "http://localhost:3000",
          changeOrigin: true
        }
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    build: {
      outDir: "dist",
      terserOptions: {
        compress: {
          drop_console: false
        }
      }
    }
  }
})
