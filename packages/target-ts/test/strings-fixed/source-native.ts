import { writeFileSync, readFileSync } from 'fs';

const struct = require('python-struct');

const mode = process.argv[2];
const file = process.argv[3];

const format = 'c'.repeat(10);
const string = 'helloworld'.split('');

if (mode === 'write') {
    const data = struct.pack(format, string);
    writeFileSync(file, data);
}

if (mode === 'read') {
    const buf = readFileSync(file);
    const data = struct.unpack(format, buf).join('');
    console.log(data);
}
