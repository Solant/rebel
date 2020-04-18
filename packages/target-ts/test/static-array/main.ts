import { ArrayStruct, read, write } from './array-compiled';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
const mode = process.argv[3];

if (mode == 'read') {
    const buffer = readFileSync(resolve(__dirname, file));
    const data = read(buffer);
    console.log(data.data.length);
    data.data.forEach(a => console.log(a));
}

if (mode == 'write') {
    const buffer = Buffer.alloc(10 * 4 + 4);
    const data: ArrayStruct = {
        size: 10,
        data: [],
    };
    for (let i = 0; i < 10; i++) {
        data.data.push(+(Math.random() * 100000).toFixed(0));
    }
    writeFileSync(file, Buffer.from(write(buffer, data)));
}
