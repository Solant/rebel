import { parse } from './parser/document';
import { transform } from './transformer';
import { generate } from './generators/ts';
import { CodeGeneratorOptions, defaultOptions } from './generators/options';

export function compile(source: string, genOpts: CodeGeneratorOptions) {
    const ast = parse(source);
    const newAst = transform(ast);
    return generate(newAst, Object.assign({}, defaultOptions(), genOpts));
}

export { transform } from './transformer';
export { generate } from './generators/ts';
export { parse } from './parser/document';
export { CompileError, CodeGenerationError } from './assertions';