export default {
    buildModules: [
        '@nuxt/typescript-build',
        '@nuxtjs/tailwindcss',
    ],
    mode: 'spa',
    head: {
        titleTemplate: 'Rebel compiler demo',
        meta: [
            { charset: 'utf-8' },
            { hid: 'description', name: 'description', content: 'Rebel online demo' }
        ]
    },
    plugins: [
        'plugins/composition',
        { src: 'plugins/codemirror', ssr: false },
    ],
    build: {
        babel: {
            sourceType: 'unambiguous',
        }
    },
    generate: {
        dir: 'dist',
    }
}
