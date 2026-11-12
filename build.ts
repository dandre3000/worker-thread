Bun.build({
    entrypoints: ['./src/browser/index.ts'],
    outdir: './build',
    naming: '[dir]/browser.[ext]',
})

Bun.build({
    entrypoints: ['./src/server/index.ts'],
    outdir: './build',
    naming: '[dir]/server.[ext]',
    target: 'node',
    external: ['node:worker_threads']
})