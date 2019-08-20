import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { read, write, Plain } from './plain-compiled';

if (process.argv[2] === 'read') {
    const buffer = readFileSync(resolve(__dirname, 'test.bin'));
    const data = read(buffer);
    console.log(data.num1);
    console.log(data.num2);
}

if (process.argv[2] === 'write') {
    const buffer = Buffer.alloc(8);
    const value: Plain = {
        num1: 24,
        num2: 25,
    };
    write(buffer, value);
    writeFileSync('test.bin', buffer);
}
