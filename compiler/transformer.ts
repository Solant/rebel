import {BaseType, CustomType, Field, isBuiltInArray, isBuiltInType, TypeTag} from './types';
import {
    AstNode,
    AstNodeType,
    BiMoAst,
    NodePosition,
    ParamFieldTypeAstNode,
    SimpleFieldTypeAstNode
} from './parser/ast';
import {isTypeName} from "./builtInTypes";
import {assertNever, CompileError} from './assertions';

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

interface EnterExitVisitor<T> {
    enter?: (node: T, path: AstNode[]) => any,
    exit?: (node: T, path: AstNode[]) => any,
}
type AstNodeVisitor = { [key in AstNodeType]?: EnterExitVisitor<DiscriminateUnion<AstNode, 'type', key>> };

function enterNode<T extends AstNode>(node: T, visitors: AstNodeVisitor[], path: AstNode[]) {
    for (let visitor of visitors) {
        // TODO: fix type casting
        // @ts-ignore
        const callback: EnterExitVisitor<T> = visitor[node.type];
        if (callback && callback.enter) {
            callback.enter(node, path);
        }
    }
}

function exitNode(node: AstNode, visitors: AstNodeVisitor[], path: AstNode[]) {
    for (let visitor of visitors) {
        // TODO: fix type casting
        // @ts-ignore
        const callback: EnterExitVisitor<T> = visitor[node.type];
        if (callback && callback.exit) {
            callback.exit(node, path);
        }
    }
}

function traverse(nodes: AstNode[], visitors: AstNodeVisitor[], path: AstNode[]) {
    nodes.forEach((node) => {
        const currentPath = [...path, node];
        switch (node.type) {
            case AstNodeType.Structure: {
                enterNode(node, visitors, currentPath);
                traverse(node.fields, visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.Field: {
                enterNode(node, visitors, currentPath);
                traverse([node.fieldType], visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.Document: {
                enterNode(node, visitors, currentPath);
                traverse(node.structures, visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.ParametrizedType: {
                enterNode(node, visitors, currentPath);
                traverse(node.typeArgs, visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.SimpleType: {
                enterNode(node, visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.FieldRef: {
                enterNode(node, visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.Number: {
                enterNode(node, visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.Endianness: {
                enterNode(node, visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            default: {
                assertNever(node);
            }
        }
    });
}

export function transform(ast: BiMoAst): BaseType[] {
    const output: BaseType[] = [];
    const visitors: AstNodeVisitor[] = [];

    // unique default structure
    (function () {
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
    })();

    class Stack<T> {
        data: T[];
        constructor() {
            this.data = [];
        }
        push(a: T) {
            this.data.push(a);
        }
        pop(): T {
            return this.data.pop()!;
        }
        head(): T {
            return this.data[this.data.length - 1];
        }
    }

    // register structures
    const structs = new Stack<CustomType>();
    const fields = new Stack<Field>();
    const types = new Stack<BaseType>();

    function pickBaseType(node: SimpleFieldTypeAstNode | ParamFieldTypeAstNode): BaseType {
        const name = node.typeName;
        if (isTypeName(name)) {
            return {
                tag: TypeTag.BuiltIn,
                name: name,
                typeArgs: [],
            };
        } else if (output.find(t => t.name === name)) {
            return output.find(t => t.name === name)!;
        } else {
            throw new CompileError(`Type ${name} is not declared`, node.pos);
        }
    }

    visitors.push({
        structure: {
            enter(node) {
                if (output.findIndex(t => t.name === node.name) !== -1) {
                    throw new CompileError(`Type ${node.name} was already declared`, node.pos);
                }
                structs.push({
                    tag: TypeTag.Custom,
                    default: node.default,
                    name: node.name,
                    props: [],
                });
                output.push(structs.head());
            },
            exit() {
                structs.pop();
            }
        },
        field: {
            enter(node) {
                const existingFields = structs.head().props;
                if (existingFields.findIndex(f => f.name === node.name) !== -1) {
                    throw new CompileError(`Field ${node.name} was already declared`, node.pos);
                }
                fields.push({
                    name: node.name,
                    access: 'public',
                    // @ts-ignore
                    type: {},
                });
                existingFields.push(fields.head());
            },
            exit() {
                fields.pop();
            }
        },
        simpletype: {
            enter(node, path) {
                switch (path[path.length - 2].type) {
                    case AstNodeType.Field:
                        fields.head().type = pickBaseType(node);
                        break;
                    case AstNodeType.ParametrizedType: {
                        const type = types.head();
                        if (isBuiltInType(type)) {
                            type.typeArgs.type = pickBaseType(node);
                        } else {
                            throw new CompileError('Custom types can\'t have type params', node.pos);
                        }
                    }
                }
            },
        },
        parametrizedtype: {
            enter(node, path) {
                const t = pickBaseType(node);
                switch (path[path.length - 2].type) {
                    case AstNodeType.Field:
                        fields.head().type = t;
                        break;
                    case AstNodeType.ParametrizedType: {
                        const type = types.head();
                        if (isBuiltInType(type)) {
                            type.typeArgs.type = t;
                        } else {
                            throw new CompileError('Custom types can\'t have type params', node.pos);
                        }
                    }
                }
                types.push(t);
            },
            exit(node) {
                const t = types.head();
                if (isBuiltInType(t) && isBuiltInArray(t)) {
                    const typeArgs = t.typeArgs;
                    if (typeArgs.type === undefined) {
                        throw new CompileError(`Arrays expect child type argument`, node.pos);
                    }
                    if (!typeArgs.length && typeArgs.lengthOf === undefined) {
                        throw new CompileError(`Arrays expect size type argument`, node.pos);
                    }
                }
                types.pop();
            },
        },
        endianness: {
            enter(node) {
                const type = types.head();
                if (isBuiltInType(type)) {
                    if (isBuiltInArray(type)) {
                        throw new CompileError(`Arrays don't have endianness param`, node.pos);
                    }
                    type.typeArgs.isLe = node.value === 'le';
                }
            }
        },
        number: {
            enter(node) {
                const type = types.head();
                if (isBuiltInType(type)) {
                    type.typeArgs.length = node.value;
                }
            }
        },
        fieldref: {
            enter(node) {
                const type = types.head();
                if (isBuiltInType(type)) {
                    const referredField = structs.head().props.find(p => p.name === node.fieldName);
                    if (referredField === undefined) {
                        throw new CompileError(`Array size field should be declared before array`, node.pos);
                    }
                    referredField.access = 'private';
                    type.typeArgs.lengthOf = node.fieldName;
                }
            }
        },
    });

    traverse([ast], visitors, []);

    return output;
}
