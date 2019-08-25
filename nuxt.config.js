export default {
    srcDir: 'web/',
    buildModules: [
        '@nuxt/typescript-build',
        '@nuxtjs/tailwindcss',
    ],
    plugins: [
        'plugins/composition',
        { src: 'plugins/codemirror', ssr: false },
    ],
    css: [
        'codemirror/lib/codemirror.css',
        'codemirror/addon/merge/merge.css',
        'codemirror/theme/base16-dark.css',
    ],
    generate: {
        dir: 'dist-web',
    }
}
