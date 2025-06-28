import { defineConfig } from "vite"

export default defineConfig({
    base: "./", // ✅ make paths relative for Netlify
    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ["three"],
                },
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    optimizeDeps: {
        include: ["three"],
    },
})