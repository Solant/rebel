export default {
    buildModules: [
        '@nuxt/typescript-build',
        '@nuxtjs/tailwindcss',
    ],
    head: {
        titleTemplate: 'BiMo compiler demo',
        meta: [
            { charset: 'utf-8' },
            { hid: 'description', name: 'description', content: 'BiMo online demo' }
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
