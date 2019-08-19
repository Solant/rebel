import { resolve } from 'path';
import { readFileSync } from 'fs';
import { read } from './plain-compiled';

const buffer = readFileSync(resolve(__dirname, 'test.bin'));
const data = read(buffer);
console.log(data.num1);
console.log(data.num2);
