export default {
    srcDir: 'web/',
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
    generate: {
        dir: 'dist-web',
    }
}
