import { parse } from './parser/document';
import { transform as irTransform } from './transformer/ir-transformer';
import { transform as targetTransform } from './transformer/target-transformer';

import generate from './generators/generator-module';
import ts from './generators/ts';
import { CompilerOptions } from './options';
import { DocumentAstNode } from './parser/ast';

export function transform(ast: DocumentAstNode) {
    return targetTransform(irTransform(ast));
}

export function compile(source: string, opts: CompilerOptions) {
    const ast = parse(source);
    const newAst = transform(ast);

    const target = ts;
    return generate(newAst, target);
}

export { CompileError, CodeGenerationError } from './assertions';