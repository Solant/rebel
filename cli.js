const { readFileSync, existsSync } = require('fs');
const { resolve, dirname } = require('path');

const currentFolder = dirname(process.argv[1]);
const filePath = process.argv[2];

const path = resolve(currentFolder, filePath);
if (!existsSync(path)) {
    console.error(`File ${path} was not found`);
    process.exit(1);
}

const target = process.argv.filter(a => a.startsWith('--target='))
    .map(a => a.split('=')[1])[0];

if (!target) {
    console.error(`Option --target was not specified`);
    process.exit(1);
}

const fileContent = readFileSync(path, { encoding: 'UTF-8'});
console.log(fileContent);
console.log(target);