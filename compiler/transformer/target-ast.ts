interface TypeDeclaration {
    name: string,
    fields: TypeFieldDeclaration[],
}

interface TypeFieldDeclaration {
    name: string,
    type: string,
}

