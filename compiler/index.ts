import { parse } from './parser/document';
import { transform } from './transformer';
import { generate } from './generators/ts';
import { CompilerOptions } from './options';

export function compile(source: string, opts: CompilerOptions) {
    const ast = parse(source);
    const newAst = transform(ast);
    return generate(newAst, opts);
}

export { transform } from './transformer';
export { generate } from './generators/ts';
export { parse } from './parser/document';
export { CompileError, CodeGenerationError } from './assertions';