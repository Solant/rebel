import { parse } from '../../compiler/parser/document';
import * as Ast from '../../compiler/parser/ast';

describe('Parser', function () {
    it('should parse', () => {
        const result: Ast.DocumentAstNode = parse(`
        default struct Test {
            length: i32 = 3+lengthof(body);
        }
        `);

        expect((result.structures[0].fields[0] as Ast.ComputedFieldAstNode).expr).toEqual({
            tag: 'BinaryOperator',
            op: '+',
            left: {type: 'Number', value: 3},
            right: {
                type: 'Function',
                name: 'lengthof',
                body: {type: 'Var', value: 'body'}
            }
        });
    });
});
