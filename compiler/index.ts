import { parse } from './parser/document';
import { transform } from './transformer';
import { generate } from './generators/ts';

export function compile(source: string) {
    const ast = parse(source);
    const newAst = transform(ast);
    return generate(newAst);
}

import { inspect } from 'util';
const a = parse(`
default struct Array {
    size: i32;
    data: array<i32<le>, #size>;
}
`);
const b = transform(a);
console.log(inspect(b, { depth: Infinity }));

export { transform } from './transformer';
export { generate } from './generators/ts';
export { parse } from './parser/document';