import { writeFileSync, readFileSync } from 'fs';

const struct = require('python-struct');

const mode = process.argv[2];
const file = process.argv[3];
const size = Number.parseInt(process.argv[4], 10);

if (mode === 'write') {
    const arr = [size];
    for (let i = 0; i < size; i++) {
        arr.push(Math.round(Math.random() * 100_000));
    }
    const data = struct.pack(`<${'L'.repeat(size + 1)}`, arr);
    writeFileSync(file, data);
}

if (mode === 'read') {
    const buf = readFileSync(file);

    let offset = 0;
    const size = buf.readInt32LE(offset);
    const array = [];
    for (let i = 0; i < size; i++) {
        offset += 4;
        array.push(buf.readInt32LE(offset));
    }

    console.log(size);
    array.forEach(i => console.log(i));
}
