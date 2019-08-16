Document = _ structs:AnyStructure+ {
	return {
	    type: 'document',
	    pos: location().start,
	    structures: structs
    };
}

AnyStructure = DefaultStructureDeclaration / StructureDeclaration

StructureDeclaration = 'struct' _ name:TypeName _ '{' dec:Declaration+ _ '}' _ {
    return {
        type: 'structure',
        pos: location().start,
        name: name.join(''),
        fields: dec,
        default: false
    }
}

DefaultStructureDeclaration = 'default' _ struct:StructureDeclaration {
    return Object.assign({}, struct, { default: true });
}

TypeName = [a-zA-Z0-9]+

VarName = [a-zA-Z0-9]+

Type = ParametrizedType / SimpleType

SimpleType = typeName:TypeName {
	return {
	    type: 'simpletype',
	    pos: location().start,
	    typeName: typeName.join('')
    };
}

TypeArg = _ name:[a-zA-Z0-9]+ ','? _ {
	return name.join('');
}

ParametrizedType = typeName:TypeName '<' args:TypeArg+ '>' {
	return {
	    type: 'parametrizedtype',
	    pos: location().start,
	    typeName: typeName.join(''),
	    typeArgs: args
    }
}

Declaration = FieldDeclaration

FieldDeclaration = _ variable:VarName _ ':' _ fieldType:Type _ ';' {
    return {
        type: 'field',
        pos: location().start,
        name: variable.join(''),
        fieldType: fieldType
    }
}

_ "whitespace" = [ \t\n\r]*

