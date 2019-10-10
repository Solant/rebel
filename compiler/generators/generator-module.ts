import * as TargetAst from '../transformer/target-ast';
import { DiscriminateUnion, EnterExitVisitor } from '../visitor';
import { ExpressionTag } from '../transformer/target-ast';
import { assertNever } from '../assertions';

export interface GeneratorModule {
    fileExtension: string,
    language: string,
    visitor: AstVisitor[],
    injects: () => string,
}

export interface VisitorScope {
    level: number,
    result: string,
}

export type AstVisitor = { [key in TargetAst.ExpressionTag]?: EnterExitVisitor<DiscriminateUnion<TargetAst.Node, 'tag', key>, TargetAst.Node, VisitorScope> };

export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

interface GeneratorOutput {
    fileExtension: string,
    fileContent: string,
}

function enterNode<T extends TargetAst.Node>(node: T, visitors: AstVisitor[], path: TargetAst.Node[], scope: VisitorScope) {
    for (let visitor of visitors) {
        const callback = visitor[node.tag] as EnterExitVisitor<T, TargetAst.Node, VisitorScope> | undefined;
        if (callback && callback.enter) {
            callback.enter(node, path, scope);
        }
    }
}

function exitNode<T extends TargetAst.Node>(node: T, visitors: AstVisitor[], path: TargetAst.Node[], scope: VisitorScope) {
    for (let visitor of visitors) {
        const callback = visitor[node.tag] as EnterExitVisitor<T, TargetAst.Node, VisitorScope> | undefined;
        if (callback && callback.exit) {
            callback.exit(node, path, scope);
        }
    }
}

function traverse(nodes: TargetAst.Node[], visitors: AstVisitor[], path: TargetAst.Node[], scope: VisitorScope) {
    nodes.forEach((node) => {
        const currentPath = [...path, node];
        switch (node.tag) {
            case ExpressionTag.Program: {
                enterNode(node, visitors, currentPath, scope);
                traverse(node.declarations, visitors, currentPath, scope);
                traverse(node.functions, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case ExpressionTag.TypeDeclaration: {
                enterNode(node, visitors, currentPath, scope);
                traverse(node.fields, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case ExpressionTag.FunctionDeclaration: {
                enterNode(node, visitors, currentPath, scope);
                traverse([node.signature], visitors, currentPath, scope);
                traverse(node.body, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case ExpressionTag.FunctionSignature: {
                enterNode(node, visitors, currentPath, scope);
                traverse(node.params, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case ExpressionTag.ReadArrayType: {
                enterNode(node, visitors, currentPath, scope);
                traverse([node.read], visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case ExpressionTag.WriteArrayType: {
                enterNode(node, visitors, currentPath, scope);
                traverse([node.write], visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }
            case ExpressionTag.MainReadFunctionDeclaration:
            case ExpressionTag.MainWriteFunctionDeclaration:
            case ExpressionTag.WriteCustomType:
            case ExpressionTag.WriteBuiltInType:
            case ExpressionTag.ReadCustomType:
            case ExpressionTag.TypeFieldDeclaration:
            case ExpressionTag.ReadBuiltInType:
            case ExpressionTag.CreateType:
            case ExpressionTag.ReturnStatement:
            case ExpressionTag.FunctionParameter: {
                enterNode(node, visitors, currentPath, scope);
                exitNode(node, visitors, currentPath, scope);
                break;
            }

            default: {
                assertNever(node);
            }
        }
    });
}

export default function generate(source: TargetAst.Program, m: GeneratorModule): GeneratorOutput {
    const scope: VisitorScope = {
        level: 0,
        result: '',
    };

    traverse([source], m.visitor, [], scope);

    return {
        fileExtension: m.fileExtension,
        fileContent: scope.result + m.injects(),
    };
}
