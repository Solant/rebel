Document = _ structs:AnyStructure+ {
	return { type: 'document', pos: location().start, structures: structs };
}

AnyStructure = DefaultStructureDeclaration / StructureDeclaration

StructureDeclaration = 'struct' _ name:TypeName _ '{' dec:Declaration+ _ '}' _ {
    return { type: 'structure', pos: location().start, name: name.join(''), fields: dec, default: false }
}

DefaultStructureDeclaration = 'default' _ struct:StructureDeclaration {
    return Object.assign({}, struct, { default: true });
}

TypeName = [a-zA-Z0-9]+

VarName = [a-zA-Z0-9]+

Declaration = FieldDeclaration / FixedArrayDeclaration / DynamicArrayDeclaration

FieldDeclaration = _ variable:VarName _ ':' _ type:TypeName _ ';' {
    return { type: 'field', pos: location().start, name: variable.join(''), fieldType: type.join('') }
}

DynamicArrayDeclaration = _ variable:VarName _ ':' _ type:TypeName _ '[' _ lengthRef:VarName  _']' ';' {
    return { variableName: variable.join(''), typeName: type.join(''), lengthRef: lengthRef.join('') }
}

FixedArrayDeclaration = _ variable:VarName _ ':' _ type:TypeName _ '[' _ length:[0-9]+  _']' ';' {
    return { variableName: variable.join(''), typeName: type.join(''), length: parseInt(length.join(''), 10) }
}

_ "whitespace" = [ \t\n\r]*

