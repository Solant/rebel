export enum AstNodeType {
    Structure = 'structure',
    Field = 'field',
    Document = 'document',
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
    fieldType: string,
}

export interface DocumentAstNode extends BaseAstNode {
    type: AstNodeType.Document,
    structures: StructureAstNode[],
}

export type AstNode = StructureAstNode | FieldAstNode | DocumentAstNode;

export type BiMoAst = DocumentAstNode;
