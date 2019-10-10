import { parse } from './parser/document';
import { transform as irTransform } from './transformer/ir-transformer';
import { transform as targetTransform } from './transformer/target-transformer';

import { ts } from './generators/generator-module';
import { CompilerOptions } from './options';

export function compile(source: string, opts: CompilerOptions) {
    const ast = parse(source);
    const newAst = targetTransform(irTransform(ast));
    return { fileContent: ts.generate(newAst), fileExtension: ts.fileExtension };
}

export { transform } from './transformer/ir-transformer';
export { generate } from './generators/ts';
export { parse } from './parser/document';
export { CompileError, CodeGenerationError } from './assertions';