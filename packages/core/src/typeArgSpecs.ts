import { Type } from './builtInTypes';
import { Expression, NodePosition } from './parser/ast';
import ExpressionNode = Expression.ExpressionNode;
import { BuiltInType } from './transformer/ir-ast';
import { CompileError } from './assertions';

type TypeCheckResult =
    { status: true }
    | { status: false, message: string, pos?: NodePosition };

const typeArgs: { [key in Type]?: (args: ExpressionNode[]) => TypeCheckResult } = {
    [Type.string](args: ExpressionNode[]) : TypeCheckResult {
        if (args.length !== 2) {
            return {
                status: false,
                message: `Expected 2 arguments, got ${args.length}`,
            };
        }

        if (args[0].body.type === 'String') {
            return {
                status: false,
                message: `Expected variable, number, function or expression, got string`,
                pos: args[0].pos,
            };
        }

        if (args[1].body.type !== 'String') {
            return {
                status: false,
                message: `Expected string, got ${args[1].body.type}`,
                pos: args[1].pos,
            };
        }

        return { status: true };
    }
};

export function checkTypes(type: BuiltInType, pos: NodePosition) {
    const typeChecker = typeArgs[type.name];
    if (typeChecker) {
        const result = typeChecker(type.args);
        if (result.status) {
            return;
        } else {
            throw new CompileError(result.message, result.pos || pos);
        }
    }
}