import {
    BaseType,
    BuiltInType,
    ComputedField,
    CustomType,
    Field,
    isBuiltInArray,
    isCustomType,
    TypeTag
} from './ir-ast';
import * as TargetAst from './target-ast';
import {
    ExpressionTag,
    MainReadFunctionDeclaration,
    MainWriteFunctionDeclaration,
    ReadArrayType,
    ReadBuiltInType,
    ReadCustomType,
    WriteArrayType,
    WriteBuiltInType,
    WriteCustomType
} from './target-ast';
import { Expression } from '../parser/ast';

function getTypeField(f: Field | ComputedField): TargetAst.TypeFieldDeclaration {
    return {
        tag: ExpressionTag.TypeFieldDeclaration,
        name: f.name,
        type: f.type,
        public: f.access === 'public',
    };
}

function getTypeDeclaration(type: CustomType): TargetAst.TypeDeclaration {
    return {
        tag: ExpressionTag.TypeDeclaration,
        name: type.name,
        fields: type.props.map(getTypeField),
    }
}

function getWriteExpr(id: string, type: BaseType, expr?: Expression.ExpressionNode): WriteArrayType | WriteBuiltInType | WriteCustomType {
    switch (type.tag) {
        case TypeTag.BuiltIn:
            if (isBuiltInArray(type)) {
                return {
                    tag: ExpressionTag.WriteArrayType,
                    id,
                    typeArg: type.typeArgs,
                    write: getWriteExpr(`${id}[i]`, type.typeArgs.type!),
                };
            }
            return {
                tag: ExpressionTag.WriteBuiltInType,
                id,
                type,
                expression: expr,
                computed: {},
            };
        case TypeTag.Custom:
            return {
                tag: ExpressionTag.WriteCustomType,
                id,
                type,
            }
    }
}

function getWriteFunctionDeclaration(type: CustomType): TargetAst.FunctionDeclaration {
    const props: Array<TargetAst.WriteCustomType | TargetAst.WriteBuiltInType | TargetAst.WriteArrayType> = type.props.map(p => {
        if (p.computed) {
            return getWriteExpr(p.name, p.type, p.expression);
        }
        return getWriteExpr(p.name, p.type);
    });

    function isWriteBuiltInType(n: TargetAst.Node): n is TargetAst.WriteBuiltInType {
        return n.tag === ExpressionTag.WriteBuiltInType;
    }

    const computedProps = type.props
        .filter(p => p.type.tag === TypeTag.BuiltIn && p.type.typeArgs.lengthOf);

    props
        .filter(isWriteBuiltInType)
        .forEach(t => {
            // @ts-ignore
            const prop = computedProps.find(p => p.type.typeArgs!.lengthOf === t.id);
            if (prop) {
                t.computed.lengthOf = prop.name;
            }
        });

    return {
        tag: ExpressionTag.FunctionDeclaration,
        id: `write${type.name}`,
        type: 'void',
        signature: {
            tag: ExpressionTag.FunctionSignature,
            params: [
                { tag: ExpressionTag.FunctionParameter, id: 'struct', type },
                { tag: ExpressionTag.FunctionParameter, id: 'stream', type: 'BimoStream' },
            ],
        },
        body: [...props],
    };
}

function getReadExpr(id: string, type: BaseType): ReadCustomType | ReadBuiltInType | ReadArrayType {
    switch (type.tag) {
        case TypeTag.BuiltIn:
            if (isBuiltInArray(type)) {
                const expr = type.args[0];
                return {
                    tag: ExpressionTag.ReadArrayType,
                    id,
                    sizeExpr: expr,
                    read: getReadExpr('temp', type.typeArgs.type!),
                    type: type,
                }
            }

            return {
                tag: ExpressionTag.ReadBuiltInType,
                id,
                type: type,
            };
        case TypeTag.Custom:
            return {
                tag: ExpressionTag.ReadCustomType,
                id,
                type,
            }
    }
}

function getReadFunctionDeclaration(type: CustomType): TargetAst.FunctionDeclaration {
    const props: Array<ReadCustomType | ReadBuiltInType | ReadArrayType> = type.props.map(prop => getReadExpr(prop.name, prop.type));

    const createType: TargetAst.CreateType = {
        tag: ExpressionTag.CreateType,
        type: type,
        id: 'ret',
    };

    const ret: TargetAst.ReturnStatement = {
        tag: ExpressionTag.ReturnStatement,
        id: 'ret',
    };

    return {
        tag: ExpressionTag.FunctionDeclaration,
        id: `read${type.name}`,
        type: `${type.name}`,
        signature: {
            tag: ExpressionTag.FunctionSignature,
            params: [{ tag: ExpressionTag.FunctionParameter, id: 'stream', type: 'BimoStream' }],
        },
        body: [...props, createType, ret],
    };
}

export function transform(types: BaseType[]) {
    const customTypes = types.filter(isCustomType);

    const mainType = types.filter(isCustomType).find(t => t.default)!;

    const mainRead: MainReadFunctionDeclaration = {
        tag: ExpressionTag.MainReadFunctionDeclaration,
        type: mainType,
    };

    const mainWrite: MainWriteFunctionDeclaration = {
        tag: ExpressionTag.MainWriteFunctionDeclaration,
        type: mainType,
    };

    const functions = [
        ...customTypes.map(getReadFunctionDeclaration),
        ...customTypes.map(getWriteFunctionDeclaration),
        mainRead,
        mainWrite,
    ];

    const result: TargetAst.Program = {
        tag: ExpressionTag.Program,
        declarations: customTypes.map(getTypeDeclaration),
        functions,
    };

    return result;
}
