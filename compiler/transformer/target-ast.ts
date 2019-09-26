import { BaseType, BuiltInType, CustomType } from './ir-ast';

export enum ExpressionTag {
    CreateType = 'CreateType',
    ReturnStatement = 'ReturnStatement',
    ReadArrayType = 'ReadArrayType',
    ReadCustomType = 'ReadCustomType',
    FunctionDeclaration = 'FunctionDeclaration',
    ReadBuiltInType = 'ReadBuiltInType',
    Program = 'Program',
    TypeDeclaration = 'TypeDeclaration',
    TypeFieldDeclaration = 'TypeFieldDeclaration',
}

export interface TypeDeclaration {
    tag: ExpressionTag.TypeDeclaration,
    name: string,
    fields: TypeFieldDeclaration[],
}

export interface TypeFieldDeclaration {
    tag: ExpressionTag.TypeFieldDeclaration,
    name: string,
    type: BaseType,
}

export interface FunctionDeclaration {
    tag: ExpressionTag.FunctionDeclaration,
    id: string,
    type: string,
    params: { id: string, type: string }[],
    body: Array<ReadBuiltInType | ReadCustomType | ReadArrayType | CreateType | ReturnStatement>,
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

export interface CreateType {
    tag: ExpressionTag.CreateType,
    name: string,
    id: string,
}

export interface ReturnStatement {
    tag: ExpressionTag.ReturnStatement,
    id: string,
}

export interface ReadArrayType {
    tag: ExpressionTag.ReadArrayType,
    id: string,
    read: ReadBuiltInType | ReadCustomType,
    sizeExpr: string,
}

export type Node = CreateType
    | ReturnStatement
    | ReadArrayType
    | ReadCustomType
    | FunctionDeclaration
    | ReadBuiltInType
    | Program
    | TypeDeclaration
    | TypeFieldDeclaration;
