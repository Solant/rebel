import * as TargetAst from '../transformer/target-ast';
import { ExpressionTag } from '../transformer/target-ast';
import { DiscriminateUnion, EnterExitVisitor } from '../visitor';
import { BaseType, TypeTag } from '../transformer/ir-ast';
import { TypeName } from '../builtInTypes';

interface GeneratorModule {
    fileExtension: string,
    language: string,
    generate: (s: TargetAst.Program) => string,
}

type AstVisitor = { [key in TargetAst.ExpressionTag]?: EnterExitVisitor<DiscriminateUnion<TargetAst.Node, 'tag', key>, TargetAst.Node> };

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
            FunctionDeclaration: {
                enter(node) {
                    result += `function ${node.id}`;
                },
                exit(node) {
                    result += '}\n';
                },
            },
            FunctionSignature: {
                enter() {
                    result += '(';
                },
                exit(node, path) {
                    const { type } = path.find(t => t.tag === ExpressionTag.FunctionDeclaration)! as TargetAst.FunctionDeclaration;
                    result += `): ${type} {\n`;
                },
            },
            FunctionParameter: {
                enter(node) {
                    if (node.type === 'BimoStream') {
                        result += `${node.id}: ${node.type}`;
                    } else {
                        throw new TypeError('oops');
                    }
                },
                exit() {
                    result += ',';
                },
            },
        };

        function enterNode<T extends TargetAst.Node>(node: T, visitors: AstVisitor[], path: TargetAst.Node[]) {
            for (let visitor of visitors) {
                const callback = visitor[node.tag] as EnterExitVisitor<T, TargetAst.Node> | undefined;
                if (callback && callback.enter) {
                    callback.enter(node, path);
                }
            }
        }

        function exitNode<T extends TargetAst.Node>(node: T, visitors: AstVisitor[], path: TargetAst.Node[]) {
            for (let visitor of visitors) {
                const callback = visitor[node.tag] as EnterExitVisitor<T, TargetAst.Node> | undefined;
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
                        traverse(node.functions, visitors, currentPath);
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
                    case ExpressionTag.FunctionDeclaration: {
                        enterNode(node, visitors, currentPath);
                        traverse([node.signature], visitors, currentPath);
                        traverse(node.body, visitors, currentPath);
                        exitNode(node, visitors, currentPath);
                        break;
                    }
                    case ExpressionTag.ReadBuiltInType: {
                        enterNode(node, visitors, currentPath);
                        exitNode(node, visitors, currentPath);
                        break;
                    }
                    case ExpressionTag.CreateType: {
                        enterNode(node, visitors, currentPath);
                        exitNode(node, visitors, currentPath);
                        break;
                    }
                    case ExpressionTag.ReturnStatement: {
                        enterNode(node, visitors, currentPath);
                        exitNode(node, visitors, currentPath);
                        break;
                    }
                    case ExpressionTag.FunctionParameter: {
                        enterNode(node, visitors, currentPath);
                        exitNode(node, visitors, currentPath);
                        break;
                    }
                    case ExpressionTag.FunctionSignature: {
                        enterNode(node, visitors, currentPath);
                        traverse(node.params, visitors, currentPath);
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
