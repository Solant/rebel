import { writeFileSync, readFileSync } from 'fs';

const struct = require('python-struct');
const desc = '<bBhHlL';

const mode = process.argv[2];
const file = process.argv[3];

if (mode === 'write') {
    const data = struct.pack(desc, [-24, 24, -500, 500, -2147484, 2147484]);
    writeFileSync(file, data);
}

if (mode === 'read') {
    const data = struct.unpack(desc, readFileSync(file));
    data.forEach((a: any) => console.log(a));
}
