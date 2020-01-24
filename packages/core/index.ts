import { parse } from './parser/document';
import { transform as irTransform } from './transformer/ir-transformer';
import { transform as targetTransform } from './transformer/target-transformer';

import generate, { GeneratorModule } from './generators/generator-module';
import { CompilerOptions } from './options';
import { DocumentAstNode } from './parser/ast';

export function transform(ast: DocumentAstNode) {
    return targetTransform(irTransform(ast));
}

export function compile(source: string, target: GeneratorModule, opts: CompilerOptions) {
    const ast = parse(source);
    const newAst = transform(ast);

    return generate(newAst, target);
}

import * as targetAst from './transformer/target-ast';
import * as irAst from './transformer/ir-ast';
import * as parserAst from './parser/ast';
import * as generatorModule from './generators/generator-module';
export { targetAst, irAst, generatorModule, parserAst };

export { parse };

export { CompileError, CodeGenerationError } from './assertions';