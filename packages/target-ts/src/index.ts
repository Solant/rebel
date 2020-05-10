import { targetAst, irAst, generatorModule, parserAst, CodeGenerationError } from '@rebel-struct/core';
import { TypeName } from '@rebel-struct/core/lib/builtInTypes';
import * as injectedCode from './runtime';
import { assertNever } from '@rebel-struct/core/lib/assertions';

function typeTransformer(type: irAst.BaseType): string {
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
        string: 'string',
    };

    switch (type.tag) {
        case irAst.TypeTag.BuiltIn:
            if (irAst.isBuiltInArray(type)) {
                return `${typeTransformer(type.typeArgs.type!)}[]`;
            }
            return types[type.name];
        case irAst.TypeTag.Custom:
            return type.name;
    }
}

const exprToString = (node: parserAst.Expression.BaseExpression): string => {
    switch(node.type) {
        case parserAst.AstNodeType.Number:
            return node.value.toString();
        case parserAst.AstNodeType.BinaryOperator:
            return exprToString(node.left) + node.op + exprToString(node.right);
        case parserAst.AstNodeType.Variable:
            return `struct.${node.value}`;
        case parserAst.AstNodeType.String: {
            return `"${node.value}"`
        }
        case parserAst.AstNodeType.Function: {
            const body = exprToString(node.body);
            if (node.name === 'lengthof') {
                return `${body}.length`;
            } else {
                throw new Error(`Unknown function ${node.name}`)
            }
        }
        default:
            assertNever(node);
            return "";
    }
};

const ts: generatorModule.GeneratorModule = {
    fileExtension: 'ts',
    language: 'TypeScript',
    visitor: [{
        TypeDeclaration: {
            enter(node, path, scope) {
                scope.level += 1;
                scope.result += `export interface ${node.name} {\n`;
            },
            exit(node, path, scope) {
                scope.level -= 1;
                scope.result += '}\n';
            }
        },
        TypeFieldDeclaration: {
            enter(node, path, scope) {
                if (node.public) {
                    scope.result += `${'\t'.repeat(scope.level)}${node.name}: ${typeTransformer(node.type)}`;
                }
            },
            exit(node, path, scope) {
                if (node.public) {
                    scope.result += ',\n';
                }
            }
        },
        FunctionDeclaration: {
            enter(node, path, scope) {
                scope.level += 1;
                scope.result += `function ${node.id}`;
            },
            exit(node, path, scope) {
                scope.level -= 1;
                scope.result += '}\n';
            },
        },
        FunctionSignature: {
            enter(node, path, scope) {
                scope.result += '(';
            },
            exit(node, path, scope) {
                const {type} = path.find(t => t.tag === targetAst.ExpressionTag.FunctionDeclaration)! as targetAst.FunctionDeclaration;
                scope.result += `): ${type} {\n`;
            },
        },
        FunctionParameter: {
            enter(node, path, scope) {
                if (node.type === 'RebelStream') {
                    scope.result += `${node.id}: RebelStream`;
                } else {
                    scope.result += `${node.id}: ${typeTransformer(node.type)}`;
                }
            },
            exit(node, path, scope) {
                scope.result += ',';
            },
        },
        ReadBuiltInType: {
            enter(node, path, scope) {
                const args = node.type.args.map(a => exprToString(a.body)).join(', ');
                scope.result += `${'\t'.repeat(scope.level)}const ${node.id}: ${typeTransformer(node.type)} = stream.read${generatorModule.capitalize(node.type.name)}(${args});\n`;
            },
        },
        ReadCustomType: {
            enter(node, path, scope) {
                scope.result += `${'\t'.repeat(scope.level)}const ${node.id}: ${node.type.name} = read${node.type.name}(stream);\n`;
            }
        },
        CreateType: {
            enter(node, path, scope) {
                scope.result += `${'\t'.repeat(scope.level)}const ${node.id} = { ${node.type.props.map(p => p.name).join(',')} };\n`;
            },
        },
        WriteBuiltInType: {
            enter(node, path, scope) {
                if (node.expression) {
                    const exprToString = (node: parserAst.Expression.BaseExpression): string => {
                        switch(node.type) {
                            case parserAst.AstNodeType.Number:
                                return node.value.toString();
                            case parserAst.AstNodeType.BinaryOperator:
                                return exprToString(node.left) + node.op + exprToString(node.right);
                            case parserAst.AstNodeType.Variable:
                                return `struct.${node.value}`;
                            case parserAst.AstNodeType.Function: {
                                const body = exprToString(node.body);
                                if (node.name === 'lengthof') {
                                    return `${body}.length`;
                                }
                                throw new CodeGenerationError(`Unsupported function "${node.name}"`);
                            }
                            default:
                                return '';
                        }
                    };

                    scope.result += `${'\t'.repeat(scope.level)}const ${node.id} = ${exprToString(node.expression.body)};\n`;
                    scope.result += `${'\t'.repeat(scope.level)}stream.write${generatorModule.capitalize(node.type.name)}(${node.id});\n`;

                } else {
                    scope.result += `${'\t'.repeat(scope.level)}stream.write${generatorModule.capitalize(node.type.name)}(struct.${node.id});\n`;
                }
            },
        },
        WriteCustomType: {
            enter(node, path, scope) {
                scope.result += `${'\t'.repeat(scope.level)}write${node.type.name}(struct.${node.id}, stream);\n`;
            },
        },
        ReturnStatement: {
            enter(node, path, scope) {
                scope.result += `${'\t'.repeat(scope.level)}return ${node.id};\n`;
            },
        },
        ReadArrayType: {
            enter(node, path, scope) {
                scope.result += `${'\t'.repeat(scope.level)}const ${node.id}: ${typeTransformer(node.type)} = [];\n`;

                let sizeExpr = '';
                if (node.sizeExpr) {
                    const exprToString = (node: parserAst.Expression.BaseExpression): string => {
                        switch(node.type) {
                            case parserAst.AstNodeType.Number:
                                return node.value.toString();
                            case parserAst.AstNodeType.BinaryOperator:
                                return exprToString(node.left) + node.op + exprToString(node.right);
                            case parserAst.AstNodeType.Variable:
                                return `${node.value}`;
                            case parserAst.AstNodeType.Function: {
                                const body = exprToString(node.body);
                                if (node.name === 'lengthof') {
                                    return `${body}.length`;
                                }
                                throw new CodeGenerationError(`Unsupported function "${node.name}"`);
                            }
                            default:
                                return '';
                        }
                    };
                    sizeExpr = exprToString(node.sizeExpr.body);
                }

                scope.result += `${'\t'.repeat(scope.level)}for (let i = 0; i < ${sizeExpr}; i++) {\n`;
                scope.level += 1;
            },
            exit(node, path, scope) {
                scope.result += `${'\t'.repeat(scope.level)}${node.id}.push(temp);\n`;
                scope.level -= 1;
                scope.result += `${'\t'.repeat(scope.level)}}\n`;
            },
        },
        WriteArrayType: {
            enter(node, path, scope) {
                let expr: string = '';

                if (node.expression) {
                    const exprToString = (node: parserAst.Expression.BaseExpression): string => {
                        switch(node.type) {
                            case parserAst.AstNodeType.Number:
                                return node.value.toString();
                            case parserAst.AstNodeType.BinaryOperator:
                                return exprToString(node.left) + node.op + exprToString(node.right);
                            case parserAst.AstNodeType.Variable:
                                return `${node.value}`;
                            case parserAst.AstNodeType.Function: {
                                const body = exprToString(node.body);
                                if (node.name === 'lengthof') {
                                    return `${body}.length`;
                                }
                                throw new CodeGenerationError(`Unsupported function "${node.name}"`);
                            }
                            default:
                                return '';
                        }
                    };
                    expr = exprToString(node.expression.body);
                }

                scope.result += `${'\t'.repeat(scope.level)}for (let i = 0; i < ${expr}; i++) {\n`;
                scope.level += 1;
            },
            exit(node, path, scope) {
                scope.level -= 1;
                scope.result += `${'\t'.repeat(scope.level)}}\n`;
            },
        },
        MainReadFunctionDeclaration: {
            enter(node, path, scope) {
                scope.result += `export function read(buffer: Buffer): ${node.type.name} {\n`;
                scope.result += `    const stream: RebelStream = new RebelStream(buffer);\n`;
                scope.result += `    return read${node.type.name}(stream);\n`;
                scope.result += `}\n`;
            },
        },
        MainWriteFunctionDeclaration: {
            enter(node, path, scope) {
                scope.result += `export function write(source: ${node.type.name}): ArrayBuffer {\n`;
                scope.result += `    const stream: RebelStream = new RebelStream();\n`;
                scope.result += `    write${node.type.name}(source, stream);\n`;
                scope.result += `    return stream.result();\n`;
                scope.result += `}\n`;
            },
        },
    }],
    // @ts-ignore
    injects: () => injectedCode.default,
};

export default ts;
