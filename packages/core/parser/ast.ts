export enum AstNodeType {
    ComputedField = 'computedfield',
    Structure = 'structure',
    Field = 'field',
    Document = 'document',
    SimpleType = 'simpletype',
    ParametrizedType = 'parametrizedtype',
    Endianness = 'endianness',
    FieldRef = 'fieldref',
    Expression = 'Expression',
    BinaryOperator = 'BinaryOperator',
    Variable = 'Var',
    Number = 'Number',
    Function = 'Function',
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
    expr: Expression.Expression,
}

export interface SimpleFieldTypeAstNode extends BaseAstNode {
    type: AstNodeType.SimpleType,
    typeName: string,
}

export interface ParamFieldTypeAstNode extends BaseAstNode {
    type: AstNodeType.ParametrizedType,
    typeName: string,
    typeArgs: Array<ParamFieldTypeAstNode | EndiannessLiteralAstNode | NumberLiteralAstNode | FieldRefAstNode>,
    args: Expression.Expression[],
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
    | FieldRefAstNode
    | Expression.Expression
    | Expression.ExpressionNode;

export namespace Expression {
    export interface Variable {
        type: AstNodeType.Variable,
        value: string
    }

    export interface Number {
        type: AstNodeType.Number,
        value: number,
    }

    export interface Function {
        type: AstNodeType.Function,
        name: string,
        body: Variable,
    }

    export interface BinaryOperator {
        type: AstNodeType.BinaryOperator,
        op: '+' | '-' | '*' | '/',
        left: ExpressionNode,
        right: ExpressionNode,
    }

    export type ExpressionNode = Variable
        | Number
        | Function
        | BinaryOperator;

    export interface Expression extends BaseAstNode {
        type: AstNodeType.Expression,
        body: ExpressionNode
    }
}

export type BiMoAst = DocumentAstNode;
