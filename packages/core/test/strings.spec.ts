import { parse } from '../src/parser/document';
import * as Ast from '../src/parser/ast';
import { transform as irTransform } from '../src/transformer/ir-transformer';
import { transform as targetTransform } from '../src/transformer/target-transformer';
import { BuiltInType, CustomType } from '../src/transformer/ir-ast';

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
