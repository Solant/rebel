export enum AstNodeType {
    ComputedField = 'computedfield',
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
    fields: Array<FieldAstNode | ComputedFieldAstNode>,
}

export interface FieldAstNode extends BaseAstNode {
    type: AstNodeType.Field,
    name: string,
    fieldType: SimpleFieldTypeAstNode | ParamFieldTypeAstNode,
}

export interface ComputedFieldAstNode extends BaseAstNode {
    type: AstNodeType.ComputedField,
    name: string,
    fieldType: SimpleFieldTypeAstNode | ParamFieldTypeAstNode,
    expr: Expression.ExpressionNode,
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
    | ComputedFieldAstNode
    | DocumentAstNode
    | SimpleFieldTypeAstNode
    | ParamFieldTypeAstNode
    | NumberLiteralAstNode
    | EndiannessLiteralAstNode
    | FieldRefAstNode;

namespace Expression {
    export enum Tag {
        BinaryOperator = 'BinaryOperator',
        Variable = 'Variable',
        Number = 'Number',
        Function = 'Function',
    }

    export interface Variable {
        tag: Tag.Variable,
        name: string
    }

    export interface Number {
        tag: Tag.Number,
        value: number,
    }

    export interface Function {
        tag: Tag.Function,
        name: string,
        body: Variable,
    }

    export interface BinaryOperator {
        tag: Tag.BinaryOperator,
        op: '+' | '-' | '*' | '/',
    }

    export type ExpressionNode = Variable
        | Number
        | Function
        | BinaryOperator;
}

export type BiMoAst = DocumentAstNode;
