import { parse } from '../../compiler/parser/document';
import * as Ast from '../../compiler/parser/ast';
import { transform as transformIR } from '../../compiler/transformer/ir-transformer';
import { transform as transformTarget } from '../../compiler/transformer/target-transformer';
import { ComputedField, CustomType } from '../../compiler/transformer/ir-ast';
import { Expression } from '../../compiler/parser/ast';
import BinaryOperator = Expression.BinaryOperator;

describe('Computed properties', function () {
    it('should transform type arg expression', () => {
        const result: Ast.DocumentAstNode = parse(`
        default struct Test {
            size: i32 = lengthof(data)*4;
            data: array<i32>(size/4);
        }
        `);

        const ir = transformIR(result);

        // @ts-ignore
        expect((((ir[0] as CustomType).props[0] as ComputedField).expression as BinaryOperator).left.name).toBe('lengthof');
        // @ts-ignore
        expect((((ir[0] as CustomType).props[0] as ComputedField).expression as BinaryOperator).right.value).toBe(4);

        // @ts-ignore
        expect((((ir[0] as CustomType).props[1] as ComputedField).type.args[0] as BinaryOperator).left.value).toBe('size');
        // @ts-ignore
        expect((((ir[0] as CustomType).props[1] as ComputedField).type.args[0] as BinaryOperator).right.value).toBe(4);
    });

    it('should create target ast', () => {
        const result: Ast.DocumentAstNode = parse(`
        default struct Test {
            size: i32 = lengthof(data)*4;
            data: array<i32>(size/4);
        }
        `);

        const target = transformTarget(transformIR(result));

        console.log(target);
    });
});
