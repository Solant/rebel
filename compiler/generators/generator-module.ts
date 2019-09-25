import * as TargetAst from '../transformer/target-ast';
import { DiscriminateUnion, EnterExitVisitor } from '../visitor';
import { BaseType } from '../transformer/ir-ast';

interface GeneratorModule {
    fileExtension: string,
    language: string,
    typeTransformer: (t: BaseType) => string,
    generate: (s: TargetAst.Program) => string,
}

type AstVisitor = { [key in TargetAst.ExpressionTag]?: EnterExitVisitor<DiscriminateUnion<TargetAst.Node, 'tag', key>> };

export const ts: GeneratorModule = {
    fileExtension: 'ts',
    language: 'TypeScript',
    generate: (s: TargetAst.Program) => {
        let result = '';

        const a: AstVisitor = {
            TypeDeclaration: {
                enter(node) {
                    result += `interface ${node.name} {\n`;
                },
                exit(node) {
                    result += '}\n';
                }
            },
            TypeFieldDeclaration: {

            },
        };

        return result;
    },
};
