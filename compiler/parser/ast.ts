export enum AstNodeType {
    Structure = 'structure',
    Field = 'field',
    Document = 'document',
    SimpleType = 'simpletype',
    ParametrizedType = 'parametrizedtype',
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
    typeArgs: string[],
}

export interface DocumentAstNode extends BaseAstNode {
    type: AstNodeType.Document,
    structures: StructureAstNode[],
}

export type AstNode = StructureAstNode | FieldAstNode | DocumentAstNode | SimpleFieldTypeAstNode | ParamFieldTypeAstNode;

export type BiMoAst = DocumentAstNode;
