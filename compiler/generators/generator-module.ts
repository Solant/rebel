import * as TargetAst from '../transformer/target-ast';
import { DiscriminateUnion, EnterExitVisitor } from '../visitor';
import { BaseType, TypeTag } from '../transformer/ir-ast';
import { TypeName } from '../builtInTypes';

interface GeneratorModule {
    fileExtension: string,
    language: string,
    generate: (s: TargetAst.Program) => string,
}

type AstVisitor = { [key in TargetAst.ExpressionTag]?: EnterExitVisitor<DiscriminateUnion<TargetAst.Node, 'tag', key>> };

export const ts: GeneratorModule = {
    fileExtension: 'ts',
    language: 'TypeScript',
    generate: (s: TargetAst.Program) => {
        let result = '';

        function typeTransformer(type: BaseType): string {
            type TypeMap = { [key in TypeName]: string };
            const types: TypeMap = {
                i8: 'number',
                i16: 'number',
                i32: 'number',
                i64: 'number',
                u8: 'number',
                u16: 'number',
                u32: 'number',
                u64: 'number',
                array: '[]',
            };

            switch (type.tag) {
                case TypeTag.BuiltIn:
                    return types[type.name];
                case TypeTag.Custom:
                    return type.name;
            }
        }

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
                enter(node) {
                    result += `    ${typeTransformer(node.type)}`;
                },
                exit(node) {
                    result += ',\n';
                }
            },
        };

        return result;
    },
};
