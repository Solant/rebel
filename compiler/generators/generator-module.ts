import * as TargetAst from '../transformer/target-ast';
import { ExpressionTag } from '../transformer/target-ast';
import { DiscriminateUnion, EnterExitVisitor } from '../visitor';
import { BaseType, isBuiltInArray, TypeTag } from '../transformer/ir-ast';
import { TypeName } from '../builtInTypes';
import { injectedCode } from './ts/runtime';

interface GeneratorModule {
    fileExtension: string,
    language: string,
    generate: (s: TargetAst.Program) => string,
}

interface VisitorScope {
    level: number,
}
type AstVisitor = { [key in TargetAst.ExpressionTag]?: EnterExitVisitor<DiscriminateUnion<TargetAst.Node, 'tag', key>, TargetAst.Node, VisitorScope> };

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

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
                    if (isBuiltInArray(type)) {
                        return `${typeTransformer(type.typeArgs.type!)}[]`;
                    }
                    return types[type.name];
                case TypeTag.Custom:
                    return type.name;
            }
        }

        const a: AstVisitor = {
            TypeDeclaration: {
                enter(node, path, scope) {
                    scope.level += 1;
                    result += `interface ${node.name} {\n`;
                },
                exit(node, path, scope) {
                    scope.level -= 1;
                    result += '}\n';
                }
            },
            TypeFieldDeclaration: {
                enter(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}${node.name}: ${typeTransformer(node.type)}`;
                },
                exit(node) {
                    result += ',\n';
                }
            },
            FunctionDeclaration: {
                enter(node, path, scope) {
                    scope.level += 1;
                    result += `function ${node.id}`;
                },
                exit(node, path, scope) {
                    scope.level -= 1;
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
                        result += `${node.id}: ${typeTransformer(node.type)}`;
                    }
                },
                exit() {
                    result += ',';
                },
            },
            ReadBuiltInType: {
                enter(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}const ${node.id}: ${typeTransformer(node.type)} = stream.read${capitalize(node.type.name)}();\n`;
                },
            },
            ReadCustomType: {
                enter(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}const ${node.id}: ${node.type.name} = read${node.type.name}(stream);\n`;
                }
            },
            CreateType: {
                enter(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}const ${node.id} = { ${node.type.props.map(p => p.name).join(',')} };\n`;
                },
            },
            WriteBuiltInType: {
                enter(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}stream.write${capitalize(node.type.name)}(struct.${node.id});\n`;
                },
            },
            WriteCustomType: {
                enter(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}write${node.type.name}(struct.${node.id}, stream);\n`;
                },
            },
            ReturnStatement: {
                enter(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}return ${node.id};\n`;
                },
            },
            ReadArrayType: {
                enter(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}const ${node.id}: ${typeTransformer(node.type)} = [];\n`;
                    result += `${'\t'.repeat(scope.level)}for (let i = 0; i ${node.sizeExpr}; i++) {\n`;
                    scope.level += 1;
                },
                exit(node, path, scope) {
                    result += `${'\t'.repeat(scope.level)}${node.id}.push(temp);\n`;
                    scope.level -= 1;
                    result += `${'\t'.repeat(scope.level)}}\n`;
                },
            },
            WriteArrayType: {
                enter(node, path, scope) {
                    let expr: string = '';
                    if (node.typeArg.length) {
                        expr = `${node.typeArg.length}`;
                    } else if (node.typeArg.lengthOf) {
                        expr = `struct.${node.id}.length`;
                    }

                    result += `${'\t'.repeat(scope.level)}for (let i = 0; i < ${expr}; i++) {\n`;
                    scope.level += 1;
                },
                exit(node, path, scope) {
                    scope.level -= 1;
                    result += `${'\t'.repeat(scope.level)}}\n`;
                },
            },
            MainReadFunctionDeclaration: {
                enter(node) {
                    result += `export function read(buffer: Buffer): ${node.type.name} {\n`;
                    result += `    const stream: BimoStream = new BimoStream(buffer);\n`;
                    result += `    return read${node.type.name}(stream);\n`;
                    result += `}\n`;
                },
            },
            MainWriteFunctionDeclaration: {
                enter(node) {
                    result += `export function write(source: ${node.type.name}, buffer: Buffer): void {\n`;
                    result += `    const stream: BimoStream = new BimoStream(buffer);\n`;
                    result += `    write${node.type.name}(source, stream);\n`;
                    result += `}\n`;
                },
            },
        };

        function enterNode<T extends TargetAst.Node>(node: T, visitors: AstVisitor[], path: TargetAst.Node[], scope: VisitorScope) {
            for (let visitor of visitors) {
                const callback = visitor[node.tag] as EnterExitVisitor<T, TargetAst.Node, VisitorScope> | undefined;
                if (callback && callback.enter) {
                    callback.enter(node, path, scope);
                }
            }
        }

        function exitNode<T extends TargetAst.Node>(node: T, visitors: AstVisitor[], path: TargetAst.Node[], scope: VisitorScope) {
            for (let visitor of visitors) {
                const callback = visitor[node.tag] as EnterExitVisitor<T, TargetAst.Node, VisitorScope> | undefined;
                if (callback && callback.exit) {
                    callback.exit(node, path, scope);
                }
            }
        }

        function traverse(nodes: TargetAst.Node[], visitors: AstVisitor[], path: TargetAst.Node[], scope: VisitorScope) {
            nodes.forEach((node) => {
                const currentPath = [...path, node];
                switch (node.tag) {
                    case ExpressionTag.Program: {
                        enterNode(node, visitors, currentPath, scope);
                        traverse(node.declarations, visitors, currentPath, scope);
                        traverse(node.functions, visitors, currentPath, scope);
                        exitNode(node, visitors, currentPath, scope);
                        break;
                    }
                    case ExpressionTag.TypeDeclaration: {
                        enterNode(node, visitors, currentPath, scope);
                        traverse(node.fields, visitors, currentPath, scope);
                        exitNode(node, visitors, currentPath, scope);
                        break;
                    }
                    case ExpressionTag.FunctionDeclaration: {
                        enterNode(node, visitors, currentPath, scope);
                        traverse([node.signature], visitors, currentPath, scope);
                        traverse(node.body, visitors, currentPath, scope);
                        exitNode(node, visitors, currentPath, scope);
                        break;
                    }
                    case ExpressionTag.FunctionSignature: {
                        enterNode(node, visitors, currentPath, scope);
                        traverse(node.params, visitors, currentPath, scope);
                        exitNode(node, visitors, currentPath, scope);
                        break;
                    }
                    case ExpressionTag.ReadArrayType: {
                        enterNode(node, visitors, currentPath, scope);
                        traverse([node.read], visitors, currentPath, scope);
                        exitNode(node, visitors, currentPath, scope);
                        break;
                    }
                    case ExpressionTag.WriteArrayType: {
                        enterNode(node, visitors, currentPath, scope);
                        traverse([node.write], visitors, currentPath, scope);
                        exitNode(node, visitors, currentPath, scope);
                        break;
                    }
                    case ExpressionTag.MainReadFunctionDeclaration:
                    case ExpressionTag.MainWriteFunctionDeclaration:
                    case ExpressionTag.WriteCustomType:
                    case ExpressionTag.WriteBuiltInType:
                    case ExpressionTag.ReadCustomType:
                    case ExpressionTag.TypeFieldDeclaration:
                    case ExpressionTag.ReadBuiltInType:
                    case ExpressionTag.CreateType:
                    case ExpressionTag.ReturnStatement:
                    case ExpressionTag.FunctionParameter: {
                        enterNode(node, visitors, currentPath, scope);
                        exitNode(node, visitors, currentPath, scope);
                        break;
                    }

                    default: {
                        // throw new TypeError(`${node.tag} is not implemented`);
                        // assertNever(node);
                    }
                }
            });
        }

        traverse([s], [a], [], { level: 0 });

        result += injectedCode();

        return result;
    },
};
