const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_APP_BASE_PATH || "/",
    plugins: [react()],
    build: {
      outDir: "dist",
      emptyOutDir: true
    },
    server: {
      port: 5173,
      proxy: {
        "/api": env.VITE_DEV_PROXY_TARGET || "http://localhost:3000"
      }
    }
  };
});
