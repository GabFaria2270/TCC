import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/css/home/home.css',
                'resources/js/app.js',
                'resources/js/home/home.js',
                'resources/css/login/login.css',
                'resources/js/login/login.js',
                'resources/css/cadastro/cadastro.css',
                'resources/js/cadastro/cadastro.js',
                'resources/js/set.tsx',
            ],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: { host: '127.0.0.1', protocol: 'ws', port: 5173 },
    },
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
