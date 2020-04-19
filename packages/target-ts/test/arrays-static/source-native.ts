import { writeFileSync, readFileSync } from 'fs';

const struct = require('python-struct');

const mode = process.argv[2];
const file = process.argv[3];

if (mode === 'write') {
    const arr = [];
    for (let i = 0; i < 10; i++) {
        arr.push(Math.round(Math.random() * 100_000));
    }
    const data = struct.pack(`<${'L'.repeat(10)}`, arr);
    writeFileSync(file, data);
}

if (mode === 'read') {
    const buf = readFileSync(file);

    let offset = 0;
    const array = [];
    for (let i = 0; i < 10; i++) {
        array.push(buf.readInt32LE(offset));
        offset += 4;
    }

    array.forEach(i => console.log(i));
}
