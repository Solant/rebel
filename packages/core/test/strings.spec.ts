import { parse } from '../parser/document';
import * as Ast from '../parser/ast';
import { transform as irTransform } from '../transformer/ir-transformer';
import { transform as targetTransform } from '../transformer/target-transformer';
import { BuiltInType, CustomType } from '../transformer/ir-ast';

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

    it('should parse encoding args', () => {
        const result: Ast.DocumentAstNode = parse(`
        default struct Test {
            length: string(3, "windows-1251");
        }
        `);

        const ir = irTransform(result);
        expect(((ir[0] as CustomType).props[0].type as BuiltInType).args.length).toBe(2);
    });
});
