export enum AstNodeType {
    ComputedField = 'computedfield',
    Structure = 'structure',
    Field = 'field',
    Document = 'document',
    ParametrizedType = 'parametrizedtype',
    Endianness = 'endianness',
    Expression = 'Expression',
    BinaryOperator = 'BinaryOperator',
    Variable = 'Var',
    Number = 'Number',
    Function = 'Function',
    String = 'String',
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
    fieldType: ParamFieldTypeAstNode,
}

export interface ComputedFieldAstNode extends BaseAstNode {
    type: AstNodeType.ComputedField,
    name: string,
    fieldType: ParamFieldTypeAstNode,
    expr: Expression.ExpressionNode,
}

export interface ParamFieldTypeAstNode extends BaseAstNode {
    type: AstNodeType.ParametrizedType,
    typeName: string,
    typeArgs: Array<ParamFieldTypeAstNode | EndiannessLiteralAstNode | NumberLiteralAstNode>,
    args: Expression.ExpressionNode[],
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

export type AstNode = StructureAstNode
    | FieldAstNode
    | ComputedFieldAstNode
    | DocumentAstNode
    | ParamFieldTypeAstNode
    | NumberLiteralAstNode
    | EndiannessLiteralAstNode
    | Expression.ExpressionNode
    | Expression.BaseExpression;

export namespace Expression {
    export interface Variable {
        type: AstNodeType.Variable,
        value: string
    }

    export interface Number {
        type: AstNodeType.Number,
        value: number,
    }

    export interface String {
        type: AstNodeType.String,
        value: string,
    }

    export interface Function {
        type: AstNodeType.Function,
        name: string,
        body: Variable,
    }

    export interface BinaryOperator {
        type: AstNodeType.BinaryOperator,
        op: '+' | '-' | '*' | '/',
        left: BaseExpression,
        right: BaseExpression,
    }

    export type BaseExpression = Variable
        | Number
        | Function
        | BinaryOperator
        | String;

    export interface ExpressionNode extends BaseAstNode {
        type: AstNodeType.Expression,
        body: BaseExpression
    }
}

export type RebelAst = DocumentAstNode;
