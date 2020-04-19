import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { read, write, MyString } from './source-rebel-compiled';

const mode = process.argv[2];
const file = process.argv[3];

if (mode === 'read') {
    const buffer = readFileSync(resolve(__dirname, file));
    const data = read(buffer);
    console.log(data.data);
}

if (mode === 'write') {
    const buffer = Buffer.alloc(20);
    const value: MyString = {
        data: 'helloworld',
    };
    write(buffer, value);
    writeFileSync(file, buffer);
}
