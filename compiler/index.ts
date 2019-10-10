import { parse } from './parser/document';
import { transform as irTransform } from './transformer/ir-transformer';
import { transform as targetTransform } from './transformer/target-transformer';

import generate from './generators/generator-module';
import ts from './generators/ts';
import { CompilerOptions } from './options';

export function compile(source: string, opts: CompilerOptions) {
    const ast = parse(source);
    const newAst = targetTransform(irTransform(ast));

    const target = ts;

    return generate(newAst, target);
}

export { transform } from './transformer/ir-transformer';
export { parse } from './parser/document';
export { CompileError, CodeGenerationError } from './assertions';