import { transform, parse } from './compiler';

import { inspect } from 'util';

const ast = parse(
    `
    default struct asd {
        var1: i32<le>;
        var2: array<i32, 5>;
    }
    `
);
console.log(inspect(ast, { depth: 6, colors: true }));
console.log(inspect(transform(ast), { depth: 5, colors: true }));