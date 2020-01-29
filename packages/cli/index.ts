import { readFileSync, writeFileSync } from 'fs';
import { compile } from '@rebel-struct/core';
import { options } from 'yargs';
import { basename, extname } from 'path';

const args = options({
    emitRuntime: {
        type: 'boolean',
        default: true,
        describe: 'Add runtime code to output file',
    },
    target: {
        type: 'string',
        choices: ['ts'],
        required: true,
        describe: 'Target language to compile'
    },
    output: {
        type: 'string',
        required: false,
        describe: 'Output file'
    },
    _: { type: 'string', required: true },
})
    .usage('Usage: $0 [FILE] [OPTIONS]')
    .argv;


const file = args._[0];
const fileContent = readFileSync(file, { encoding: 'UTF-8'});

try {
    require.resolve(`@rebel-struct/target-${args.target}`)
} catch (e) {
    console.error(e);
    process.exit(1);
}
const targetModule = require(`@rebel-struct/target-${args.target}`);

const output = compile(fileContent, targetModule, args);
const outputFile = args.output ? args.output : (basename(file, extname(file)) + `.${output.fileExtension}`);
writeFileSync(outputFile, output.fileContent);
