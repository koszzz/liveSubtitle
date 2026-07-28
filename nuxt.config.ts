// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
    compatibilityDate: '2026-07-28',
    devtools: { enabled: false },

    css: ['~/assets/main.css'],

    modules: ['@pinia/nuxt', '@xarenas107/nuxt-socket-io'],

    vite: {
        plugins: [
            {
                name: 'fix-debug-esm',
                enforce: 'pre',
                resolveId(id, _importer, options) {
                    // engine.io-client's esm-debug imports the 'debug' CJS module.
                    // Vite can't CJS→ESM convert browser.js, so replace with ESM shim.
                    // Only client side — server-side uses the real debug module.
                    if (id === 'debug' && !(options as any)?.ssr) {
                        return resolve(currentDir, 'shims/debug.mjs');
                    }
                },
            },
        ],
    },

    nitro: {
        experimental: {
            openAPI: true,
        },
    },

    typescript: {
        strict: true,
        tsConfig: {
            compilerOptions: {
                noUncheckedIndexedAccess: false,
                esModuleInterop: true,
            },
        },
    },
});
