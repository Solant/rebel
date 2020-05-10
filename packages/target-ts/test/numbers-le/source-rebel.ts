import { readFileSync, writeFileSync } from 'fs';
import { read, write, Plain } from './source-rebel-compiled';

const mode = process.argv[2];
const file = process.argv[3];

if (mode === 'read') {
    const buffer = readFileSync(file);
    const data = read(buffer);
    console.log(data.num1);
    console.log(data.num2);
    console.log(data.num3);
    console.log(data.num4);
    console.log(data.num5);
    console.log(data.num6);
}

if (mode === 'write') {
    const value: Plain = {
        num1: -24,
        num2: 24,
        num3: -500,
        num4: 500,
        num5: -2147484,
        num6: 2147484,
    };
    writeFileSync(file, Buffer.from(write(value)));
}
