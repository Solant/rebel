import { BaseType, CustomType, Field, isCustomType } from './ir-ast';
import * as TargetAst from './target-ast';

function getTypeField(f: Field): TargetAst.TypeFieldDeclaration {
    return {
        name: f.name,
        type: f.type.name,
    };
}

function getTypeDeclaration(type: CustomType): TargetAst.TypeDeclaration {
    return {
        name: type.name,
        fields: type.props.map(getTypeField),
    }
}

export function transform(types: BaseType[]) {
    const customTypes = types.filter(isCustomType);

    const result: TargetAst.Program = {
        declarations: customTypes.map(getTypeDeclaration),
    };

    return result;
}
