import { readFileSync, writeFileSync } from 'fs';
import { compile } from './compiler';
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

const output = compile(fileContent, args);
const outputFile = args.output ? args.output : (basename(file, extname(file)) + `.${output.fileExtension}`);
writeFileSync(outputFile, output.fileContent);
