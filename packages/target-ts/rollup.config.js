import { string } from 'rollup-plugin-string';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: {
        dir: 'lib',
        format: 'cjs'
    },
    external: ['@rebel-struct/core', '@rebel-struct/core/lib/assertions'],
    plugins: [
        string({
            include: 'src/runtime.ts',
        }),
        typescript({
            exclude: ['src/runtime.ts'],
        }),
    ]
};
