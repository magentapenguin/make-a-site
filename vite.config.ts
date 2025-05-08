import htmlPurge from 'vite-plugin-purgecss'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        htmlPurge({}) as any,
    ],
    base: '/make-a-site/',
    server: {
        hmr: true
    }
})