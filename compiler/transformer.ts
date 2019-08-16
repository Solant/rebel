import {BaseType, CustomType, CustomTypeField, TypeTag} from './types';
import {AstNode, AstNodeType, BiMoAst, NodePosition} from './parser/ast';

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

interface EnterExitVisitor<T> {
    enter?: (node: T) => any,
    exit?: (node: T) => any,
}
type AstNodeVisitor = { [key in AstNodeType]?: EnterExitVisitor<DiscriminateUnion<AstNode, 'type', key>> };

function enterNode<T extends AstNode>(node: T, visitors: AstNodeVisitor[]) {
    for (let visitor of visitors) {
        // TODO: fix type casting
        // @ts-ignore
        const callback: EnterExitVisitor<T> = visitor[node.type];
        if (callback && callback.enter) {
            callback.enter(node);
        }
    }
}

function exitNode(node: AstNode, visitors: AstNodeVisitor[]) {
    for (let visitor of visitors) {
        // TODO: fix type casting
        // @ts-ignore
        const callback: EnterExitVisitor<T> = visitor[node.type];
        if (callback && callback.exit) {
            callback.exit(node);
        }
    }
}

function traverse(nodes: AstNode[], visitors: AstNodeVisitor[]) {
    nodes.forEach((node) => {
        switch (node.type) {
            case AstNodeType.Structure: {
                enterNode(node, visitors);
                traverse(node.fields, visitors);
                exitNode(node, visitors);
                break;
            }
            case AstNodeType.Field: {
                enterNode(node, visitors);
                traverse([node.fieldType], visitors);
                exitNode(node, visitors);
                break;
            }
            case AstNodeType.Document: {
                enterNode(node, visitors);
                traverse(node.structures, visitors);
                exitNode(node, visitors);
                break;
            }
            case AstNodeType.ParametrizedType: {
                enterNode(node, visitors);
                exitNode(node, visitors);
                break;
            }
            default:
                throw new CompileError(`AST node ${node.type} is not supported`);
        }
    });
}

class CompileError extends Error {
    constructor(m: string, pos?: { line: number, column: number }) {
        if (pos) {
            super(`Compilation error at input:${pos.line}:${pos.column}\n${m}`)
        } else {
            super(m);
        }
    }
}

export function transform(ast: BiMoAst): BaseType[] {
    const output: BaseType[] = [];
    const visitors: AstNodeVisitor[] = [];

    // populate builtin types
    output.push({ tag: TypeTag.BuiltIn, name: 'i32' });
    output.push({ tag: TypeTag.BuiltIn, name: 'array' });

    // unique default structure
    let defaultCounter = 0;
    let defaultPos: NodePosition | undefined = undefined;
    visitors.push({
        structure: {
            enter(node) {
                if (node.default) {
                    if (defaultCounter) {
                        throw new CompileError(`Default structure already defined at ${defaultPos}`, node.pos);
                    }
                    defaultCounter++;
                    defaultPos = node.pos;
                }
            }
        },
        document: {
            exit() {
                if (defaultCounter === 0) {
                    throw new CompileError(`No default structure found in the document`);
                }
            }
        }
    });

    // register structures
    let currentStruct: CustomType | undefined  = undefined;
    let currentFied: CustomTypeField | undefined = undefined;
    visitors.push({
        structure: {
            enter(node) {
                if (output.findIndex(t => t.name === node.name) !== -1) {
                    throw new CompileError(`Type ${node.name} was already declared`, node.pos);
                }
                currentStruct = {
                    tag: TypeTag.Custom,
                    default: node.default,
                    name: node.name,
                    props: [],
                };
                output.push(currentStruct);
            }
        },
        field: {
            enter(node) {
                const fields = currentStruct!.props;
                if (fields.findIndex(f => f.name === node.name) !== -1) {
                    throw new CompileError(`Field ${node.name} was already declared`, node.pos);
                }

                const fieldType = output.find(t => t.name === node.fieldType.typeName);
                if (!fieldType) {
                    throw new CompileError(`Type ${node.fieldType.typeName} is not declared`, node.pos);
                }

                currentFied = {
                    name: node.name,
                    type: fieldType,
                    args: [],
                };
                fields.push(currentFied);
            },
        },
        parametrizedtype: {
            enter(node) {
                currentFied!.args = node.typeArgs;
            }
        },
    });

    traverse([ast], visitors);

    return output;
}
