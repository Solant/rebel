export enum AstNodeType {
    Structure = 'structure',
    Field = 'field',
    Document = 'document',
    SimpleType = 'simpletype',
    ParametrizedType = 'parametrizedtype',
    Number = 'number',
    Endianness = 'endianness',
    FieldRef = 'fieldref'
}

export interface NodePosition {
    line: number,
    column: number,
    offset: number,
}

export interface BaseAstNode {
    pos: NodePosition,
}

export interface StructureAstNode extends BaseAstNode {
    type: AstNodeType.Structure,
    default: boolean,
    name: string,
    fields: FieldAstNode[],
}

export interface FieldAstNode extends BaseAstNode {
    type: AstNodeType.Field,
    name: string,
    fieldType: SimpleFieldTypeAstNode | ParamFieldTypeAstNode,
}

export interface SimpleFieldTypeAstNode extends BaseAstNode {
    type: AstNodeType.SimpleType,
    typeName: string,
}

export interface ParamFieldTypeAstNode extends BaseAstNode {
    type: AstNodeType.ParametrizedType,
    typeName: string,
    typeArgs: Array<ParamFieldTypeAstNode | EndiannessLiteralAstNode | NumberLiteralAstNode | FieldRefAstNode>,
}

export interface DocumentAstNode extends BaseAstNode {
    type: AstNodeType.Document,
    structures: StructureAstNode[],
}

export interface NumberLiteralAstNode extends BaseAstNode {
    type: AstNodeType.Number,
    value: number,
}

export interface EndiannessLiteralAstNode extends BaseAstNode {
    type: AstNodeType.Endianness,
    value: string,
}

export interface FieldRefAstNode extends BaseAstNode {
    type: AstNodeType.FieldRef,
    fieldName: string,
}

export type AstNode = StructureAstNode
    | FieldAstNode
    | DocumentAstNode
    | SimpleFieldTypeAstNode
    | ParamFieldTypeAstNode
    | NumberLiteralAstNode
    | EndiannessLiteralAstNode
    | FieldRefAstNode;

export type BiMoAst = DocumentAstNode;
