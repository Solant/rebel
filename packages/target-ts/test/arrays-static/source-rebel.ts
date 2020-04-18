import { ArrayStruct, read, write } from './source-rebel-compiled';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const mode = process.argv[2];
const file = process.argv[3];

if (mode == 'read') {
    const buffer = readFileSync(resolve(__dirname, file));
    const data = read(buffer);
    data.data.forEach(a => console.log(a));
}

if (mode == 'write') {
    const buffer = Buffer.alloc(1000);
    const data: ArrayStruct = {
        data: [],
    };
    for (let i = 0; i < parseInt(process.argv[4]); i++) {
        data.data.push(+(Math.random() * 100000).toFixed(0));
    }
    write(buffer, data);
    writeFileSync(file, buffer);
}
