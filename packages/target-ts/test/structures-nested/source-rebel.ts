import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { read, write, Plain } from './source-rebel-compiled';

const mode = process.argv[2];
const file = process.argv[3];

if (mode === 'read') {
    const buffer = readFileSync(resolve(__dirname, file));
    const data = read(buffer);
    console.log(data.num1);
    console.log(data.child.num2);
    console.log(data.child.num3);
    console.log(data.child.num4);
}

if (mode === 'write') {
    const value: Plain = {
        num1: -24,
        child: {
            num2: 24,
            num3: -2147484,
            num4: 2147484,
        },
    };
    writeFileSync(file, Buffer.from(write(value)));
}
