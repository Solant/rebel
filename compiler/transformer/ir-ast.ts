import { TypeName } from '../builtInTypes';
import { Expression } from '../parser/ast';
import ExpressionNode = Expression.ExpressionNode;

export enum TypeTag {
    BuiltIn,
    Custom,
}

export interface BuiltInType {
    tag: TypeTag.BuiltIn,
    name: TypeName,
    typeArgs: TypeArgument,
}

export function isBuiltInType(t: BaseType): t is BuiltInType {
    return t.tag === TypeTag.BuiltIn;
}

export function isBuiltInArray(t: BuiltInType): boolean {
    return t.name === 'array';
}

export interface CustomType {
    tag: TypeTag.Custom,
    default: boolean,
    name: string,
    props: Field[],
}

export function isCustomType(t: BaseType): t is CustomType {
    return t.tag === TypeTag.Custom;
}

export type BaseType = CustomType | BuiltInType;

export interface TypeArgument {
    isLe?: boolean,
    lengthOf?: string,
    length?: number,
    type?: BaseType,
}

export interface Field {
    name: string,
    access: 'public' | 'private',
    type: BaseType,
}

export interface ComputedField extends Field {
    computed: true,
    expression: Expression.ExpressionNode,
}