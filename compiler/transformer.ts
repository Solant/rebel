import {BaseType, BuiltInType, CustomType, CustomTypeField, TypeTag} from './types';
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
            case AstNodeType.SimpleType: {
                enterNode(node, visitors);
                exitNode(node, visitors);
                break;
            }
            default: {
                // switch type guard
                const assertNever = (a: never): void => {
                    throw new CompileError(`AST node ${(<AstNode>a).type} is not supported`);
                };
                assertNever(node);
            }
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

    interface TypeArgumentRestriction {
        minLength?: number,
        maxLength?: number,
        length?: number,
        allowedValues?: string[],
    }
    const restrictionsMap: Map<string, TypeArgumentRestriction[]> = new Map();

    function numberTypeFactory(name: string): BuiltInType {
        restrictionsMap.set(name, [
            { minLength: 0, maxLength: 1, allowedValues: ['le', 'be'] }
        ]);
        return {
            tag: TypeTag.BuiltIn,
            name,
        }
    }

    // populate builtin types
    // signed
    output.push(numberTypeFactory('i8'));
    output.push(numberTypeFactory('i16'));
    output.push(numberTypeFactory('i32'));
    output.push(numberTypeFactory('i64'));
    // unsigned
    output.push(numberTypeFactory('u8'));
    output.push(numberTypeFactory('u16'));
    output.push(numberTypeFactory('u32'));
    output.push(numberTypeFactory('u64'));
    // float
    output.push(numberTypeFactory('f32'));
    output.push(numberTypeFactory('f64'));

    output.push({ tag: TypeTag.BuiltIn, name: 'array' });
    restrictionsMap.set('array', [
        { length: 2 },
    ]);

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

    // parametrized type validation
    visitors.push({
        parametrizedtype: {
            enter(node) {
                const restrictions: TypeArgumentRestriction[] | undefined = restrictionsMap.get(node.typeName);
                if (restrictions && restrictions.length) {
                    restrictions.forEach(r => {
                        if (r.length) {
                            if (node.typeArgs.length !== r.length) {
                                throw new CompileError(`Expected ${r.length} type arguments, got ${node.typeArgs.length}`, node.pos);
                            }
                        }
                        if (r.maxLength) {
                            if (node.typeArgs.length > r.maxLength) {
                                throw new CompileError(`Expected ${r.maxLength} type argument(s) at max, got ${node.typeArgs.length}`, node.pos);
                            }
                        }
                    });
                }
            }
        },
    });

    traverse([ast], visitors);

    return output;
}
