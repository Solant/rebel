import { parse } from './parser/document';
import { transform } from './transformer';
import { generate } from './generators/ts';

export function compile(source: string) {
    const ast = parse(source);
    const newAst = transform(ast);
    return generate(newAst);
}

export { transform } from './transformer';
export { generate } from './generators/ts';
export { parse } from './parser/document';
export { CompileError, CodeGenerationError } from './assertions';