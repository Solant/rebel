import { run } from '../../../../tests/utils';
import { compile } from '@bimo/core';
import ts from '../../index';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function read(name: string) {
    return readFileSync(resolve(__dirname, name), { encoding: 'utf-8' });
}

function write(name: string, content: string) {
    return writeFileSync(resolve(__dirname, name), content, { encoding: 'utf-8' });
}

describe('Nested struct', function () {
    it('should read and write properly', async () => {
        await run({
            cwd: __dirname,
            native: {
                prepare: 'g++ main.cpp',
                read: './a.out read',
                write: './a.out write',
            },
            bimo: {
                prepare() {
                    const source = compile(read('plain.bimo'), ts, { emitRuntime: true, target: 'ts' });
                    write('plain-compiled.ts', source.fileContent);
                },
                read: 'npx ts-node read.ts read',
                write: 'npx ts-node read.ts write',
            }
        })
    }, 30000);
});
