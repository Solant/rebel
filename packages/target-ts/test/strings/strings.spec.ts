import { run } from '../../../../tests/utils';
import { compile } from '@rebel-struct/core';
import ts from '../../src';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function read(name: string) {
    return readFileSync(resolve(__dirname, name), { encoding: 'utf-8' });
}

function write(name: string, content: string) {
    return writeFileSync(resolve(__dirname, name), content, { encoding: 'utf-8' });
}

describe('Strings', function () {
    it('should read and write properly', async () => {
        await run({
            cwd: __dirname,
            native: {
                prepare: 'g++ main.cpp',
                read: './a.out test.bin read',
                write: './a.out test.bin write',
            },
            bimo: {
                prepare() {
                    const source = compile(read('strings.bimo'), ts, { emitRuntime: true, target: 'ts' });
                    write('strings-compiled.ts', source.fileContent);
                },
                read: 'npx ts-node main.ts test.bin read',
                write: 'npx ts-node main.ts test.bin write',
            }
        })
    }, 30000);
});
