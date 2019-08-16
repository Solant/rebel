import {BaseType, CustomType, CustomTypeField, TypeTag} from '../../types';
import {readFileSync} from "fs";
import { resolve } from 'path';

interface NativeTypeInfo {
    name: string,
    defaultValue: any,
}

class CodeGenError extends Error {
    constructor(m: string) {
        super(m);
    }
}

const nativeTypeMap: Map<string, NativeTypeInfo> = new Map();
nativeTypeMap.set('i32', { name: 'number', defaultValue: 0 });

function getTypeInfo(field: CustomTypeField): NativeTypeInfo {
    const res = nativeTypeMap.get(field.type.name);
    if (!res) {
        throw new CodeGenError(`Unsupported type ${field.type.name}`);
    }
    return res;
}

function generateInterface(type: CustomType): string {
    let result = `export interface ${type.name} {\n`;
    result += type.props.map(generateField).join(',\n');
    result += '\n}';

    return result;
}

function capitalize() {
    return function (text: string, render: Function): string {
        let val = render(text);
        return val.charAt(0).toUpperCase() + val.slice(1);
    }
}

function generateStructRead(type: CustomType): string {
    const fields = type.props.map(p => ({ name: p.name, value: getTypeInfo(p).defaultValue }));
    return render(`
export function read{{#capitalize}}{{name}}{{/capitalize}}(): {{name}} {
    const var1 = {
        {{#fields}}
        {{name}}: {{value}},
        {{/fields}}
    };
    
    return var1;
}
    `, {
        name: type.name,
        fields,
        capitalize,
    });
}

function generateMainStructRead(type: CustomType): string {
    const fields = type.props.map(t => ({ name: t.name, type: t.type.name, nativeType: getTypeInfo(t) }));
    return render(`
export function read(buffer: Buffer): {{name}} {
    const stream = new BimoStream(buffer);
    
    const var1 = {
        {{#fields}}
        {{name}}: {{nativeType.defaultValue}},
        {{/fields}}
    };
    
    {{#fields}}
    var1.{{name}} = stream.read{{#capitalize}}{{type}}{{/capitalize}}();
    {{/fields}}
    
    return var1;
}
    `, {
        name: type.name,
        fields,
        capitalize,
    });
}

function isCustomType(type: BaseType): type is CustomType {
    return type.tag === TypeTag.Custom;
}

export function generate(types: BaseType[]): string {
    let code = '';

    code += types
        .filter(isCustomType)
        .map(generateInterface)
        .join('\n');

    code += types
        .filter(isCustomType)
        .filter(t => t.default)
        .map(generateMainStructRead)
        .join('\n');

    return code;
}
