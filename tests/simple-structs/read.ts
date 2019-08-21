import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { read, write, Plain } from './plain-compiled';

if (process.argv[2] === 'read') {
    const buffer = readFileSync(resolve(__dirname, 'test.bin'));
    const data = read(buffer);
    console.log(data.num1);
    console.log(data.num2);
    console.log(data.num3);
    console.log(data.num4);
}

if (process.argv[2] === 'write') {
    const buffer = Buffer.alloc(20);
    const value: Plain = {
        num1: -24,
        num2: 24,
        num3: -2147484,
        num4: 2147484,

    };
    write(buffer, value);
    writeFileSync('test.bin', buffer);
}
