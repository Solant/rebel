import { TypeName } from '../builtInTypes';
import { Expression } from '../parser/ast';

export enum TypeTag {
    BuiltIn,
    Custom,
}

export interface BuiltInType {
    tag: TypeTag.BuiltIn,
    name: TypeName,
    typeArgs: TypeArgument,
    args: Expression.ExpressionNode[],
}

export function isBuiltInType(t: BaseType): t is BuiltInType {
    return t.tag === TypeTag.BuiltIn;
}

export function isBuiltInArray(t: BuiltInType): boolean {
    return t.name === 'array';
}

type TypeField = Field | ComputedField;

export interface CustomType {
    tag: TypeTag.Custom,
    default: boolean,
    name: string,
    props: TypeField[],
}

export function isCustomType(t: BaseType): t is CustomType {
    return t.tag === TypeTag.Custom;
}

export type BaseType = CustomType | BuiltInType;

export interface TypeArgument {
    isLe?: boolean,
    type?: BaseType,
}

export interface Field {
    name: string,
    access: 'public' | 'private',
    type: BaseType,
    computed: false,
}

export interface ComputedField {
    name: string,
    access: 'public' | 'private',
    type: BaseType,
    computed: true,
    expression: Expression.ExpressionNode,
}