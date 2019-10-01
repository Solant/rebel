import { BaseType, BuiltInType, CustomType } from './ir-ast';

export enum ExpressionTag {
    WriteCustomType = 'WriteCustomType',
    WriteBuiltInType = 'WriteBuiltInType',
    FunctionSignature = 'FunctionSignature',
    FunctionParameter = 'FunctionParameter',
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

export type Void = 'void';

export interface FunctionDeclaration {
    tag: ExpressionTag.FunctionDeclaration,
    id: string,
    type: string | Void,
    signature: FunctionSignature,
    body: Array<ReadBuiltInType | ReadCustomType | ReadArrayType | CreateType | ReturnStatement | WriteBuiltInType | WriteCustomType>,
}

export interface FunctionSignature {
    tag: ExpressionTag.FunctionSignature,
    params: FunctionParameter[],
}

export interface FunctionParameter {
    tag: ExpressionTag.FunctionParameter,
    id: string,
    type: BaseType | 'BimoStream',
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

export interface WriteBuiltInType {
    tag: ExpressionTag.WriteBuiltInType,
    id: string,
    type: BuiltInType,
}

export interface WriteCustomType {
    tag: ExpressionTag.WriteCustomType,
    id: string,
    type: CustomType,
}

export interface ReadCustomType {
    tag: ExpressionTag.ReadCustomType,
    id: string,
    type: CustomType,
}

export interface CreateType {
    tag: ExpressionTag.CreateType,
    type: CustomType,
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
    | TypeFieldDeclaration
    | FunctionParameter
    | FunctionSignature
    | WriteCustomType
    | WriteBuiltInType;
