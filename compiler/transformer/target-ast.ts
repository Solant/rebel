import { BuiltInType, CustomType } from './ir-ast';

export enum ExpressionTag {
    ReadArrayType,
    ReadCustomType,
    FunctionDeclaration,
    ReadBuiltInType,
    Program,
    TypeDeclaration,
    TypeFieldDeclaration,
}

export interface TypeDeclaration {
    tag: ExpressionTag.TypeDeclaration,
    name: string,
    fields: TypeFieldDeclaration[],
}

export interface TypeFieldDeclaration {
    tag: ExpressionTag.TypeFieldDeclaration,
    name: string,
    type: string,
}

export interface FunctionDeclaration {
    tag: ExpressionTag.FunctionDeclaration,
    id: string,
    type: string,
    params: { id: string, type: string }[],
    body: Array<ReadBuiltInType | ReadCustomType | ReadArrayType>,
}

export interface Program {
    tag: ExpressionTag.Program,
    declarations: TypeDeclaration[],
    functions: FunctionDeclaration[],
}

export interface ReadBuiltInType {
    tag: ExpressionTag.ReadBuiltInType,
    id: string,
    type: BuiltInType,
}

export interface ReadCustomType {
    tag: ExpressionTag.ReadCustomType,
    id: string,
    type: CustomType,
}

export interface ReadArrayType {
    tag: ExpressionTag.ReadArrayType,
    id: string,
    read: ReadBuiltInType | ReadCustomType,
    sizeExpr: string,
}
