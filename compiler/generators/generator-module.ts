import * as TargetAst from '../transformer/target-ast';
import { DiscriminateUnion, EnterExitVisitor } from '../visitor';
import { BaseType, TypeTag } from '../transformer/ir-ast';
import { TypeName } from '../builtInTypes';
import { ExpressionTag } from '../transformer/target-ast';

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
                    result += `    ${node.name}: ${typeTransformer(node.type)}`;
                },
                exit(node) {
                    result += ',\n';
                }
            },
        };

        function enterNode<T extends TargetAst.Node>(node: T, visitors: AstVisitor[], path: T[]) {
            for (let visitor of visitors) {
                const callback = visitor[node.tag] as EnterExitVisitor<T> | undefined;
                if (callback && callback.enter) {
                    callback.enter(node, path);
                }
            }
        }

        function exitNode<T extends TargetAst.Node>(node: T, visitors: AstVisitor[], path: T[]) {
            for (let visitor of visitors) {
                const callback = visitor[node.tag] as EnterExitVisitor<T> | undefined;
                if (callback && callback.exit) {
                    callback.exit(node, path);
                }
            }
        }

        function traverse(nodes: TargetAst.Node[], visitors: AstVisitor[], path: TargetAst.Node[]) {
            nodes.forEach((node) => {
                const currentPath = [...path, node];
                switch (node.tag) {
                    case ExpressionTag.Program: {
                        enterNode(node, visitors, currentPath);
                        traverse(node.declarations, visitors, currentPath);
                        // traverse(node.functions, visitors, currentPath);
                        exitNode(node, visitors, currentPath);
                        break;
                    }
                    case ExpressionTag.TypeDeclaration: {
                        enterNode(node, visitors, currentPath);
                        traverse(node.fields, visitors, currentPath);
                        exitNode(node, visitors, currentPath);
                        break;
                    }
                    case ExpressionTag.TypeFieldDeclaration: {
                        enterNode(node, visitors, currentPath);
                        exitNode(node, visitors, currentPath);
                        break;
                    }

                    default: {
                        throw new TypeError(`${node.tag} is not implemented`);
                        // assertNever(node);
                    }
                }
            });
        }

        traverse([s], [a], []);

        return result;
    },
};
