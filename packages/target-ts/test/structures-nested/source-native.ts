import { writeFileSync, readFileSync } from 'fs';

const struct = require('python-struct');

const mode = process.argv[2];
const file = process.argv[3];
const format = '<bBlL';

if (mode === 'write') {
    const data = struct.pack(format, [-24, 24, -2147484, 2147484]);
    writeFileSync(file, data);
}

if (mode === 'read') {
    const buf = readFileSync(file);
    const data = struct.unpack(format, buf);
    data.forEach((a: any) => console.log(a));
}
