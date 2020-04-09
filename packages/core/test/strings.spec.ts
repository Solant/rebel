import { parse } from '../parser/document';
import * as Ast from '../parser/ast';
import { transform as irTransform } from '../transformer/ir-transformer';
import { transform as targetTransform } from '../transformer/target-transformer';

describe('Strings', function () {
    it('should parse', () => {
        const result: Ast.DocumentAstNode = parse(`
        default struct Test {
            length: string(3, "ascii");
        }
        `);

        const ir = irTransform(result);
        const target = targetTransform(ir);
    });
});
