import {BaseType, CustomType, Field, isCustomType, TypeTag} from '../../types';
import { render } from 'mustache';
import {injectedCode} from "./runtime";

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
nativeTypeMap.set('i8', { name: 'number', defaultValue: 0 });
nativeTypeMap.set('i16', { name: 'number', defaultValue: 0 });
nativeTypeMap.set('i32', { name: 'number', defaultValue: 0 });
nativeTypeMap.set('i64', { name: 'number', defaultValue: 0 });

nativeTypeMap.set('u8', { name: 'number', defaultValue: 0 });
nativeTypeMap.set('u16', { name: 'number', defaultValue: 0 });
nativeTypeMap.set('u32', { name: 'number', defaultValue: 0 });
nativeTypeMap.set('u64', { name: 'number', defaultValue: 0 });

function generateInterface(type: CustomType): string {
    return render(`
export interface {{name}} {
    {{#fields}}
    {{{.}}},
    {{/fields}}
}
    `, {
        name: type.name,
        fields: type.props.map(fieldDeclaration),
    });
}

function capitalize() {
    return function (text: string, render: Function): string {
        return capitalizeNative(render(text));
    }
}

function capitalizeNative(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function generateStructRead(type: CustomType): string {
    return render(`
export function read{{#capitalize}}{{name}}{{/capitalize}}(stream: BimoStream): {{name}} {
    const var1: {{name}} = {
        {{#definitions}}
        {{{.}}},
        {{/definitions}}
    };
    
    {{#reads}}
    {{{.}}};
    {{/reads}}
    
    return var1;
}
    `, {
        name: type.name,
        definitions: type.props.map(fieldDefaultDefenition),
        reads: type.props.map(p => fieldRead('var1', p)),
        capitalize,
    });
}

function generateStructWrite(type: CustomType): string {
    return render(`
export function write{{#capitalize}}{{name}}{{/capitalize}}(stream: BimoStream, value: {{#capitalize}}{{name}}{{/capitalize}}): void {
    
    {{#writes}}
    {{{.}}};
    {{/writes}}
}
    `, {
        name: type.name,
        writes: type.props.map(p => fieldWrite('value', p)),
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

interface GeneratorOutput {
    fileExtension: string,
    fileContent: string,
}
export function generate(types: BaseType[]): GeneratorOutput {
    let code = '';

    // Inject runtime
    code += injectedCode();

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

/**
 * Generate structure field declaration
 * @param field
 */
export function fieldDeclaration(field: Field) {
    switch (field.type.tag) {
        case TypeTag.BuiltIn: {
            const nativeType = nativeTypeMap.get(field.type.name);
            if (!nativeType) {
                throw new CodeGenError(`Unsupported type ${field.type.name}`);
            }
            return `${field.name}: ${nativeType.name}`;
        }
        case TypeTag.Custom: {
            return `${field.name}: ${field.type.name}`;
        }
    }
}

/**
 * Generate structure field default value
 * @param field
 */
function fieldDefaultDefenition(field: Field) {
    switch (field.type.tag) {
        case TypeTag.BuiltIn: {
            const nativeType = nativeTypeMap.get(field.type.name);
            if (!nativeType) {
                throw new CodeGenError(`Unsupported type ${field.type.name}`);
            }
            return `${field.name}: ${nativeType.defaultValue}`;
        }
        case TypeTag.Custom: {
            return `// @ts-ignore
            ${field.name}: {}`;
        }
    }
}

function fieldRead(parent: string, field: Field) {
    switch (field.type.tag) {
        case TypeTag.BuiltIn: {
            const nativeType = nativeTypeMap.get(field.type.name);
            if (!nativeType) {
                throw new CodeGenError(`Unsupported type ${field.type.name}`);
            }
            return `${parent}.${field.name} = stream.read${capitalizeNative(field.type.name)}()`;
        }
        case TypeTag.Custom: {
            return `${parent}.${field.name} = read${capitalizeNative(field.type.name)}(stream)`;
        }
    }
}

function fieldWrite(parent: string, field: Field) {
    switch (field.type.tag) {
        case TypeTag.BuiltIn: {
            const nativeType = nativeTypeMap.get(field.type.name);
            if (!nativeType) {
                throw new CodeGenError(`Unsupported type ${field.type.name}`);
            }
            return `stream.write${capitalizeNative(field.type.name)}(${parent}.${field.name})`;
        }
        case TypeTag.Custom: {
            return `write${capitalizeNative(field.type.name)}(stream, ${parent}.${field.name})`;
        }
    }
}
