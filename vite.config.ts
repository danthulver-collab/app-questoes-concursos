import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwind from "@tailwindcss/vite"
import path from "path";
import runableWebsiteRuntime from "runable-website-runtime"

export default defineConfig({
        plugins: [react(), runableWebsiteRuntime(), cloudflare(), tailwind()],
        resolve: {
                alias: {
                        "@": path.resolve(__dirname, "./src/web"),
                },
        },
        optimizeDeps: {
                exclude: ["better-auth", "better-call"],
        },
        server: {
                allowedHosts: true,
        }
});
