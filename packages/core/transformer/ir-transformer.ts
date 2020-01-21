import {
    BaseType,
    BuiltInType,
    ComputedField,
    CustomType,
    Field,
    isBuiltInArray,
    isBuiltInType,
    TypeTag
} from './ir-ast';
import {
    AstNode,
    AstNodeType,
    BiMoAst,
    NodePosition,
    ParamFieldTypeAstNode,
    SimpleFieldTypeAstNode
} from '../parser/ast';
import { isTypeName } from '../builtInTypes';
import { assertNever, CompileError } from '../assertions';

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

interface EnterExitVisitor<T> {
    enter?: (node: T, path: AstNode[]) => any,
    exit?: (node: T, path: AstNode[]) => any,
}
type AstNodeVisitor = { [key in AstNodeType]?: EnterExitVisitor<DiscriminateUnion<AstNode, 'type', key>> };

function enterNode<T extends AstNode>(node: T, visitors: AstNodeVisitor[], path: AstNode[]) {
    for (let visitor of visitors) {
        const callback = visitor[node.type] as EnterExitVisitor<T> | undefined;
        if (callback && callback.enter) {
            callback.enter(node, path);
        }
    }
}

function exitNode<T extends AstNode>(node: T, visitors: AstNodeVisitor[], path: AstNode[]) {
    for (let visitor of visitors) {
        const callback = visitor[node.type] as EnterExitVisitor<T> | undefined;
        if (callback && callback.exit) {
            callback.exit(node, path);
        }
    }
}


function pathFinder<T extends B, B extends { type: any }>(path: B[], type: any): T | undefined {
    const item = path.find(item => item.type === type);
    if (item) {
        return item as T;
    } else {
        return undefined;
    }
}

function traverse(nodes: AstNode[], visitors: AstNodeVisitor[], path: AstNode[]) {
    nodes.forEach((node) => {
        const currentPath = [...path, node];
        if (node === null) {
            console.log('ooops');
        }
        switch (node.type) {
            case AstNodeType.Structure: {
                enterNode(node, visitors, currentPath);
                traverse(node.fields, visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.ComputedField: {
                enterNode(node, visitors, currentPath);
                traverse([node.fieldType], visitors, currentPath);
                traverse([node.expr], visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.BinaryOperator: {
                enterNode(node, visitors, currentPath);
                traverse([node.left], visitors, currentPath);
                traverse([node.right], visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.Function: {
                enterNode(node, visitors, currentPath);
                traverse([node.body], visitors, currentPath);
                exitNode(node, visitors, currentPath);
                break;
            }
            case AstNodeType.Variable: {
                enterNode(node, visitors, currentPath);
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
                // FIXME: nested type args
                traverse(node.args.filter(Boolean), visitors, currentPath);
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
    const fields = new Stack<Field | ComputedField>();
    const types = new Stack<BaseType>();

    function pickBaseType(node: SimpleFieldTypeAstNode | ParamFieldTypeAstNode): BaseType {
        const name = node.typeName;
        if (isTypeName(name)) {
            return {
                tag: TypeTag.BuiltIn,
                name: name,
                typeArgs: {},
                args: [],
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
        [AstNodeType.ComputedField]: {
            enter(node) {
                const existingFields = structs.head().props;
                if (existingFields.findIndex(f => f.name === node.name) !== -1) {
                    throw new CompileError(`Field ${node.name} was already declared`, node.pos);
                }
                fields.push({
                    name: node.name,
                    access: 'private',
                    // @ts-ignore
                    type: {},
                    computed: true,
                    expression: {},
                });
                existingFields.push(fields.head());
            },
            exit(node) {
                fields.pop();
            },
        },
        [AstNodeType.BinaryOperator]: {
            enter(node) {
                const f = fields.head() as ComputedField;
                // FIXME: remove f.expression null check by moving it to child visitor
                if (f.expression && Object.keys(f.expression).length === 0) {
                    f.expression = node;
                }
            }
        },
        [AstNodeType.Function]: {
            enter(node) {
                const f = fields.head() as ComputedField;
                // FIXME: remove f.expression null check by moving it to child visitor
                if (f.expression && Object.keys(f.expression).length === 0) {
                    f.expression = node;
                }
            }
        },
        simpletype: {
            enter(node, path) {
                switch (path[path.length - 2].type) {
                    case AstNodeType.Field:
                    case AstNodeType.ComputedField:
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
                    case AstNodeType.ComputedField:
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

                // Find type expression to parse
                if (node.args.length && node.args[0] === null) {
                    return;
                }

                // FIXME: nested type args
                traverse(node.args, [{
                    [AstNodeType.Function]: {
                        enter(node) {
                            const type = types.head();
                            if (isBuiltInType(type) && type.args.length === 0) {
                                type.args.push(node);
                            }
                        }
                    },
                    [AstNodeType.Number]: {
                        enter(node) {
                            const type = types.head();
                            if (isBuiltInType(type) && type.args.length === 0) {
                                type.args.push(node);
                            }
                        }
                    },
                    [AstNodeType.BinaryOperator]: {
                        enter(node) {
                            const type = types.head();
                            if (isBuiltInType(type) && type.args.length === 0) {
                                type.args.push(node);
                            }
                        }
                    },
                    [AstNodeType.Variable]: {
                        enter(node) {
                            const type = types.head();
                            if (isBuiltInType(type) && type.args.length === 0) {
                                type.args.push(node);
                            }
                        }
                    },
                }], [...path, node]);
            },
            exit(node) {
                const t = types.head();
                if (isBuiltInType(t) && isBuiltInArray(t)) {
                    const typeArgs = t.typeArgs;
                    if (typeArgs.type === undefined) {
                        throw new CompileError(`Arrays expect child type argument`, node.pos);
                    }
                    // TODO: remove size and lengthOf
                    if (!typeArgs.length && typeArgs.lengthOf === undefined && t.args.length === 0) {
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
        Number: {
            enter(node, path) {
                const type = types.head();

                if(!pathFinder<ParamFieldTypeAstNode, AstNode>(path, AstNodeType.ParametrizedType)) {
                    if (type && isBuiltInType(type)) {
                        type.typeArgs.length = node.value;
                    }
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