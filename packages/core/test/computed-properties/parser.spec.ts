import { parse } from '../../src/parser/document';
import * as Ast from '../../src/parser/ast';
import { transform as transformIR } from '../../src/transformer/ir-transformer';
import { transform as transformTarget } from '../../src/transformer/target-transformer';
import { ComputedField, CustomType } from '../../src/transformer/ir-ast';

describe('Parser', function () {
    it('should parse', () => {
        const result: Ast.DocumentAstNode = parse(`
        default struct Test {
            length: i32 = 3+lengthof(body);
        }
        `);

        expect((result.structures[0].fields[0] as Ast.ComputedFieldAstNode).expr).toMatchSnapshot();
    });

    describe('IR transformer', () => {
        const res = parse(`
        default struct Test {
            length: i32 = 3+lengthof(body);
        }
        `);
        const types = transformIR(res);

        it('should create prop', () => {
            expect((types[0] as CustomType).props[0].name).toBe('length');
        });

        it('should add body', () => {
            expect(((types[0] as CustomType).props[0] as ComputedField).expression).toMatchSnapshot();
        });
    });

    describe('target transformer', () => {
        const res = parse(`
        default struct Test {
            length: i32 = 3+lengthof(body);
        }
        `);

        it('should create target AST', () => {
            expect(() => transformTarget(transformIR(res))).not.toThrow();
        });
    });
});
