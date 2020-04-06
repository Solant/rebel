import { parse } from '../parser/document';
import * as Ast from '../parser/ast';

describe('Strings', function () {
    it('should parse', () => {
        const result: Ast.DocumentAstNode = parse(`
        default struct Test {
            length: string<i32<le>>(3);
        }
        `);

        // @ts-ignore
        console.log(result.structures[0].fields[0].fieldType);
    });
});
