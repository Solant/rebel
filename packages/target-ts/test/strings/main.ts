import { MyString, read, write } from './strings-compiled';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
const mode = process.argv[3];

if (mode == 'read') {
    const buffer = readFileSync(resolve(__dirname, file));
    const data = read(buffer);
    console.log(data.data);
}

if (mode == 'write') {
    const buffer = Buffer.alloc(1000);
    const data: MyString = {
        data: "helloworld",
    };
    writeFileSync(file, Buffer.from(write(buffer, data)));
}
