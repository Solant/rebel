import {BaseType, CustomType, CustomTypeField, TypeTag} from '../../types';
import {readFileSync} from "fs";
import { resolve } from 'path';

const nativeTypeMap: { [key: string]: string } = {
    'i32le': 'number',
};

function generateField(field: CustomTypeField) {
    return `    ${field.name}: ${nativeTypeMap[field.type.name]}`;
}

function generateInterface(type: CustomType): string {
    let result = `export interface ${type.name} {\n`;
    result += type.props.map(generateField).join(',\n');
    result += '\n}';

    return result;
}

function isCustomType(type: BaseType): type is CustomType {
    return type.tag === TypeTag.Custom;
}

function injectRuntime() {
    return readFileSync(resolve(__dirname, 'runtime.js'), { encoding: 'UTF-8' });
}

function injectMainRead(type: CustomType) {
    return block(`export function read(buffer): ${type.name}`,
        block(`const result: ${type.name} =`,
            type.props.map(generateField)
        )
    ).join('\n');
}

function block(declaration: string, lines: string[]) {
    let result = [];
    result.push(`${declaration} {\n`);
    for (let line of lines) {
        result.push(line + '\n');
    }
    result.push('}');

    return result;
}

export function generate(types: BaseType[]): string {
    let code = '';

    code += injectRuntime() + '\n';

    code += injectMainRead(types.filter(isCustomType).find(t => t.default)!) + '\n';

    code += types
        .filter(isCustomType)
        .map(generateInterface)
        .join('\n');

    return code;
}
