import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { parse, transform, generate } from './compiler';
import { getCliArg } from './cli-util';

const currentFolder = dirname(process.argv[1]);
const filePath = process.argv[2];

const path = resolve(currentFolder, filePath);
if (!existsSync(path)) {
    console.error(`File ${path} was not found`);
    process.exit(1);
}

const target = getCliArg(process.argv, 'target');

if (!target) {
    throw new Error(`Option --target was not specified`);
}

let outputFileName = getCliArg(process.argv, 'output');
if (!outputFileName) {
    outputFileName = 'output';
}

const fileContent = readFileSync(path, { encoding: 'UTF-8'});

const output = generate(transform(parse(fileContent)));
writeFileSync(resolve(currentFolder, `${outputFileName}.${output.fileExtension}`), output.fileContent);
