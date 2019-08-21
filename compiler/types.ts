export enum TypeTag {
    BuiltIn,
    Custom,
}

export interface BuiltInType {
    tag: TypeTag.BuiltIn,
    name: string,
}

export function isCustomType(t: BaseType): t is CustomType {
    return t.tag === TypeTag.Custom;
}

export interface CustomType {
    tag: TypeTag.Custom,
    default: boolean,
    name: string,
    props: CustomTypeField[],
}

export type BaseType = CustomType | BuiltInType;

export interface CustomTypeField {
    name: string,
    type: BaseType,
    args: string[],
}
