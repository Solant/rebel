export interface TypeDeclaration {
    name: string,
    fields: TypeFieldDeclaration[],
}

export interface TypeFieldDeclaration {
    name: string,
    type: string,
}

export interface Program {
    declarations: TypeDeclaration[],
}
