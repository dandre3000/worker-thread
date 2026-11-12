// import dynamicImport from 'vite-plugin-dynamic-import'

export default {
    build: {
        target: 'es2022', // or 'es2022'
        /* rollupOptions: {
            output: {
                // Ensures workers are served as standalone files
                chunkFileNames: "build/[name].js",
                entryFileNames: "build/[name].js",
            },
        } */
    },
    server: {
        cors: true,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            // "Access-Control-Allow-Origin": "*",
            "Cross-Origin-Resource-Policy": "cross-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    }
}