import { BaseType, BuiltInType, CustomType, TypeArgument } from './ir-ast';
import { Expression } from '../parser/ast';
import ExpressionNode = Expression.ExpressionNode;

export enum ExpressionTag {
    MainWriteFunctionDeclaration = 'MainWriteFunctionDeclaration',
    MainReadFunctionDeclaration = 'MainReadFunctionDeclaration',
    WriteCustomType = 'WriteCustomType',
    WriteBuiltInType = 'WriteBuiltInType',
    FunctionSignature = 'FunctionSignature',
    FunctionParameter = 'FunctionParameter',
    CreateType = 'CreateType',
    ReturnStatement = 'ReturnStatement',
    ReadArrayType = 'ReadArrayType',
    WriteArrayType = 'WriteArrayType',
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
    public: boolean,
}

export type Void = 'void';

export interface FunctionDeclaration {
    tag: ExpressionTag.FunctionDeclaration,
    id: string,
    type: string | Void,
    signature: FunctionSignature,
    body: Array<ReadBuiltInType | ReadCustomType | ReadArrayType | CreateType | ReturnStatement | WriteBuiltInType | WriteCustomType | WriteArrayType>,
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

type BaseFunction = FunctionDeclaration | MainReadFunctionDeclaration | MainWriteFunctionDeclaration;

export interface Program {
    tag: ExpressionTag.Program,
    declarations: TypeDeclaration[],
    functions: BaseFunction[],
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
    expression?: ExpressionNode
    computed: {
        lengthOf?: string,
    },
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
    type: BuiltInType,
    read: ReadBuiltInType | ReadCustomType | ReadArrayType,
    sizeExpr: ExpressionNode | undefined,
}

export interface WriteArrayType {
    tag: ExpressionTag.WriteArrayType,
    id: string,
    typeArg: TypeArgument,
    write: WriteArrayType | WriteCustomType | WriteBuiltInType,
}

export interface MainReadFunctionDeclaration {
    tag: ExpressionTag.MainReadFunctionDeclaration,
    type: CustomType,
}

export interface MainWriteFunctionDeclaration {
    tag: ExpressionTag.MainWriteFunctionDeclaration,
    type: CustomType,
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
    | WriteBuiltInType
    | MainReadFunctionDeclaration
    | MainWriteFunctionDeclaration
    | WriteArrayType;
