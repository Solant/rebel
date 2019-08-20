import {BaseType, CustomType, CustomTypeField, TypeTag} from '../../types';
import { render } from 'mustache';
import { resolve } from 'path';
import { readFileSync } from 'fs';

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
    const fields = type.props.map(p => ({ name: p.name, type: getTypeInfo(p).name }));
    return render(`
export interface {{name}} {
    {{#fields}}
    {{name}}: {{type}},
    {{/fields}}
}
    `, {
        name: type.name,
        fields,
    });
}

function capitalize() {
    return function (text: string, render: Function): string {
        let val = render(text);
        return val.charAt(0).toUpperCase() + val.slice(1);
    }
}

function generateStructRead(type: CustomType): string {
    const fields = type.props.map(t => ({ name: t.name, type: t.type.name, nativeType: getTypeInfo(t) }));
    return render(`
export function read{{#capitalize}}{{name}}{{/capitalize}}(stream: BimoStream): {{name}} {
    const var1: {{name}} = {
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

function generateStructWrite(type: CustomType): string {
    const fields = type.props.map(t => ({ name: t.name, type: t.type.name, nativeType: getTypeInfo(t) }));
    return render(`
export function write{{#capitalize}}{{name}}{{/capitalize}}(stream: BimoStream, value: {{#capitalize}}{{name}}{{/capitalize}}): void {
    
    {{#fields}}
    stream.write{{#capitalize}}{{type}}{{/capitalize}}(value.{{name}});
    {{/fields}}
}
    `, {
        name: type.name,
        fields,
        capitalize,
    });
}

function generatemainStructWrite(type: CustomType): string {
    return render(`
export function write(buffer: Buffer, value: {{name}}): void {
    const stream = new BimoStream(buffer);
    
    return write{{#capitalize}}{{name}}{{/capitalize}}(stream, value);
}
    `, {
        name: type.name,
        capitalize,
    });
}

function generateMainStructRead(type: CustomType): string {
    return render(`
export function read(buffer: Buffer): {{name}} {
    const stream = new BimoStream(buffer);
    
    return read{{#capitalize}}{{name}}{{/capitalize}}(stream);
}
    `, {
        name: type.name,
        capitalize,
    });
}

function isCustomType(type: BaseType): type is CustomType {
    return type.tag === TypeTag.Custom;
}

interface GeneratorOutput {
    fileExtension: string,
    fileContent: string,
}
export function generate(types: BaseType[]): GeneratorOutput {
    let code = '';

    // Inject runtime
    code += readFileSync(resolve(__dirname, 'runtime.ts'), { encoding: 'UTF-8' });

    code += types
        .filter(isCustomType)
        .map(generateInterface)
        .join('\n');

    code += types
        .filter(isCustomType)
        .map(t => ([generateStructRead(t), generateStructWrite(t)]))
        .flat()
        .join('\n');

    code += types
        .filter(isCustomType)
        .filter(t => t.default)
        .map(t => ([generateMainStructRead(t), generatemainStructWrite(t)]))
        .flat()
        .join('\n');

    return { fileExtension: 'ts', fileContent: code };
}
