import { BaseType, ComputedField, CustomType, Field, isBuiltInArray, isBuiltInType, TypeTag } from './ir-ast';
import {
    AstNode,
    AstNodeType,
    RebelAst,
    NodePosition,
    ParamFieldTypeAstNode,
} from '../parser/ast';
import { isTypeName } from '../builtInTypes';
import { assertNever, CompileError } from '../assertions';
import { enterNode, exitNode, GenericVisitor } from '../visitor';
import { checkTypes } from '../typeArgSpecs';

type AstNodeVisitor = GenericVisitor<AstNodeType, AstNode, undefined, any>;


function pathFinder<T extends B, B extends { type: any }>(path: B[], type: any): T | undefined {
    const item = path.find(item => item.type === type);
    if (item) {
        return item as T;
    } else {
        return undefined;
    }
}

function traverse<T>(nodes: AstNode[], visitors: AstNodeVisitor[], path: AstNode[], scope: T) {
    nodes.forEach((node) => {
        const currentPath = [...path, node];
        const scope = undefined;
        if (node === null) {
            console.log('ooops');
        }
        switch (node.type) {
            case AstNodeType.Structure: {
                enterNode(node, visitors, currentPath, scope);
                traverse(node.fields, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.ComputedField: {
                enterNode(node, visitors, currentPath, scope);
                traverse([node.fieldType], visitors, currentPath, scope);
                traverse([node.expr], visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.BinaryOperator: {
                enterNode(node, visitors, currentPath, scope);
                traverse([node.left], visitors, currentPath, scope);
                traverse([node.right], visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.Function: {
                enterNode(node, visitors, currentPath, scope);
                traverse([node.body], visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.Variable: {
                enterNode(node, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.Field: {
                enterNode(node, visitors, currentPath, scope);
                traverse([node.fieldType], visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.Document: {
                enterNode(node, visitors, currentPath, scope);
                traverse(node.structures, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.ParametrizedType: {
                enterNode(node, visitors, currentPath, scope);
                traverse(node.typeArgs, visitors, currentPath, scope);
                traverse(node.args, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.Number: {
                enterNode(node, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.Endianness: {
                enterNode(node, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.Expression: {
                enterNode(node, visitors, currentPath, scope);
                traverse([node.body], visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case AstNodeType.String: {
                enterNode(node, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            default: {
                assertNever(node);
            }
        }
    });
}

export function transform(ast: RebelAst): BaseType[] {
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

    function pickBaseType(node: ParamFieldTypeAstNode): BaseType {
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
                    expression: node.expr,
                });
                existingFields.push(fields.head());
            },
            exit(node) {
                fields.pop();
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

                // Find type body to parse
                if (node.args.length && node.args[0] === null) {
                    return;
                }

                traverse(node.args, [{
                    [AstNodeType.Expression]: {
                        enter(childNode, childPath) {
                            if (childPath.length === path.length + 1) {
                                if (isBuiltInType(t)) {
                                    t.args.push(childNode);
                                }
                            }
                        }
                    },
                }], [...path], undefined);
                if (isBuiltInType(t)) {
                    checkTypes(t, node.pos);
                }
            },
            exit(node) {
                const t = types.head();
                if (isBuiltInType(t) && isBuiltInArray(t)) {
                    const typeArgs = t.typeArgs;
                    if (typeArgs.type === undefined) {
                        throw new CompileError(`Arrays expect child type argument`, node.pos);
                    }
                    if (t.args.length === 0) {
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
    });

    traverse([ast], visitors, [], undefined);

    return output;
}
