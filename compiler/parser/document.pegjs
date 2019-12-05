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

NumberLiteral = [0-9]+ {
	return {
	    type: 'Number',
	    pos: location().start,
	    value: parseInt(text())
    };
}

EndiannessLiteral = val:('le' / 'be') {
	return {
    	type: 'endianness',
    	pos: location().start,
		value: text(),
    }
}

FieldRef = '#' fieldName:[a-zA-Z0-9]+ {
	return {
	    type: 'fieldref',
	    pos: location().start,
	    fieldName: fieldName.join(''),
    };
}

PossibleTypeArgs = FieldRef / ParametrizedType / NumberLiteral / EndiannessLiteral / SimpleType

TypeArg = _ arg:PossibleTypeArgs ','? _ {
	return arg;
}

ParametrizedType = typeName:TypeName '<' args:TypeArg+ '>' {
	return {
	    type: 'parametrizedtype',
	    pos: location().start,
	    typeName: typeName.join(''),
	    typeArgs: args
    }
}

Declaration = ComputedFieldDeclaration / FieldDeclaration

FieldDeclaration = _ variable:VarName _ ':' _ fieldType:Type _ ';' {
    return {
        type: 'field',
        pos: location().start,
        name: variable.join(''),
        fieldType: fieldType
    }
}

ComputedFieldDeclaration = _ variable:VarName _ ':' _ fieldType:Type _ '=' _ expr:ExpressionBody _ ';' {
    return {
        type: 'computedfield',
        pos: location().start,
        name: variable.join(''),
        fieldType: fieldType,
        expr: expr,
    }
}

ExpressionBody = additive

additive
  = first:multiplicative rest:(("+" / "-") multiplicative)+ {
    return rest.reduce(function(memo: any, curr: any) {
      return {
        type: 'BinaryOperator',
        op: curr[0], left: memo, right: curr[1]
      };
    }, first);
  }
  / multiplicative

multiplicative
  = first:primary rest:(("*" / "/") primary)+ {
    return rest.reduce(function(memo: any, curr: any) {
      return {
        type: 'BinaryOperator',
        op: curr[0], left: memo, right: curr[1]
      };
    }, first);
  }
  / primary

primary
  = NumberLiteral / fun / var
  / "(" additive:additive ")" { return additive; }

fun = name:[a-zA-Z]+ '(' body:var ')' {
 return {
     type: 'Function',
        name: name.join(''),
        body: body,
    }
}

var = [a-zA-Z0-9]+ {
    return { type: 'Var', value: text() }
}

_ "whitespace" = [ \t\n\r]*

