import { readFileSync, writeFileSync } from 'fs';
import { parse, transform, generate } from './compiler';
import { options } from 'yargs';
import { basename, extname } from 'path';

const args = options({
    emitRuntime: { type: 'boolean', default: true },
    target: { type: 'string', choices: ['ts'], required: true },
    output: { type: 'string', required: false },
    _: { type: 'string', required: true },
})
    .help()
    .argv;


const file = args._[0];
const fileContent = readFileSync(file, { encoding: 'UTF-8'});

const output = generate(transform(parse(fileContent)), {});
const outputFile = args.output ? args.output : (basename(file, extname(file)) + `.${output.fileExtension}`);
writeFileSync(outputFile, output.fileContent);
