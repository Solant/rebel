import { BaseType, BuiltInType, CustomType, Field, isBuiltInType, isCustomType, TypeTag } from '../../types';
import { render } from 'mustache';
import { injectedCode } from './runtime';
import { assertNever } from '../../switch-guard';
import { ok } from 'assert';
import { Type } from '../../builtInTypes';
import { isNullOrUndefined } from 'util';

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
        fields: type.props.map(fieldDeclaration).filter(Boolean),
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
    {{{.}}}
    {{/reads}}
    
    return var1;
}
    `, {
        name: type.name,
        definitions: type.props.map(fieldDefaultDefenition).filter(Boolean),
        reads: type.props.map(p => fieldRead('var1', p)),
        capitalize,
    });
}

function generateStructWrite(type: CustomType): string {
    return render(`
export function write{{#capitalize}}{{name}}{{/capitalize}}(stream: BimoStream, value: {{#capitalize}}{{name}}{{/capitalize}}): void {
    
    {{#writes}}
    {{{.}}}
    {{/writes}}
}
    `, {
        name: type.name,
        writes: type.props.map(p => fieldWrite('value', p, type)),
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
export function fieldDeclaration(field: Field): string | undefined {
    if (field.access === 'public') {
        return `${field.name}: ${typeDeclaration(field.type)}`;
    }
}

/**
 * Generate structure field default value
 * @param field
 */
function fieldDefaultDefenition(field: Field): string | undefined {
    if (field.access === 'private') {
        return undefined;
    }
    switch (field.type.tag) {
        case TypeTag.BuiltIn: {
            return `${field.name}: ${defaultTypeValue(field.type)}`;
        }
        case TypeTag.Custom: {
            return `// @ts-ignore
            ${field.name}: ${defaultTypeValue(field.type)}`;
        }
    }
}

function fieldRead(parent: string, field: Field): string {
    let result = '';

    if (isBuiltInType(field.type) && field.type.name === 'array') {
        result += `
    for (let i = 0; i < ${field.type.typeArgs.lengthOf}; i++) {
        ${parent}.${field.name}.push(${typeIOFunction(field.type.typeArgs.type!, 'read')}());
    }
`;
    } else {
        if (field.access === 'private') {
            result += `const ${field.name} = `
        } else {
            result += `${parent}.${field.name} = `
        }
        if (isCustomType(field.type)) {
            result += `${typeIOFunction(field.type, 'read')}(stream)`;
        } else {
            result += `${typeIOFunction(field.type, 'read')}()`;
        }
    }
    return result;
}

function fieldWrite(parent: string, field: Field, type: CustomType): string {
    let result = '';
    if (isBuiltInType(field.type) && field.type.name === 'array') {
        result +=
`
    for (let i = 0; i < ${parent}.${field.name}.length; i++) {
        ${typeIOFunction(field.type.typeArgs.type!, 'write')}(${parent}.${field.name}[i]);
    }
`;
    } else {
        if (field.access === 'private') {
            let a = type.props.find(f => (<BuiltInType>f.type).typeArgs.lengthOf === field.name);
            result += `${typeIOFunction(field.type, 'write')}(${parent}.${a!.name}.length)`;
        } else {
            if (isCustomType(field.type)) {
                result += `${typeIOFunction(field.type, 'write')}(stream, ${parent}.${field.name})`;
            } else {
                result += `${typeIOFunction(field.type, 'write')}(${parent}.${field.name})`;
            }
        }
    }
    return result;
}

function typeDeclaration(type: BaseType): string {
    if (isBuiltInType(type)) {
        switch (type.name) {
            case 'i8':
            case 'i16':
            case 'i32':
            case 'i64':
            case 'u8':
            case 'u16':
            case 'u32':
            case 'u64': {
                return 'number';
            }
            case 'array': {
                const childType = type.typeArgs.type!;
                ok(childType);
                return `${typeDeclaration(childType)}[]`;
            }
            default: {
                assertNever(type.name);
                return '';
            }
        }
    } else {
        return `${type.name}`
    }
}

function defaultTypeValue(type: BaseType): string {
    if (isBuiltInType(type)) {
        switch (type.name) {
            case 'i8':
            case 'i16':
            case 'i32':
            case 'i64':
            case 'u8':
            case 'u16':
            case 'u32':
            case 'u64': {
                return '0';
            }
            case 'array': {
                const childType = type.typeArgs.type!;
                ok(childType);
                return '[]';
            }
            default: {
                assertNever(type.name);
                return '';
            }
        }
    } else {
        return 'undefined';
    }
}

type IO = 'read' | 'write';
function typeIOFunction(type: BaseType, flag: IO): string {
    if (isBuiltInType(type)) {
        if (type.name === 'array') {
            throw new TypeError('Array is not supported');
        } else {
            return `stream.${flag}${capitalizeNative(type.name)}`
        }
    } else {
        return `${flag}${capitalizeNative(type.name)}`
    }
}
