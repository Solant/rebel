import { transform, parse, generate } from './compiler';

import { inspect } from 'util';

const ast = parse(
    `
    default struct asd {
        var1: i32<le>;
        var2: i32<le>;
    }
    `
);
console.log(inspect(ast, { depth: 6, colors: true }));
console.log(inspect(transform(ast), { depth: 5, colors: true }));
console.log(inspect(transform(ast), { depth: 5, colors: true }));
console.log(generate(transform(ast)));