export enum Type {
    i8 = 'i8',
    i16 = 'i16',
    i32 = 'i32',
    i64 = 'i64',
    u8 = 'u8',
    u16 = 'u16',
    u32 = 'u32',
    u64 = 'u64',
    array = 'array',
}

export type TypeName = keyof typeof Type;

export function isTypeName(name: string) : name is TypeName {
    return Type.hasOwnProperty(name);
}
