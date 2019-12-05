import { parse } from '../../compiler/parser/document';
import { transform as transformIR } from '../../compiler/transformer/ir-transformer';
import { transform as transformTarget } from '../../compiler/transformer/target-transformer';
import generate from '../../compiler/generators/generator-module';
import ts from '../../compiler/generators/ts';

describe('Generator', function () {
    describe('code generation', () => {
        const res = parse(`
        default struct Test {
            length: i32 = 3+lengthof(body);
        }
        `);
        const source = transformTarget(transformIR(res));
        let output = generate(source, ts);

        it('should produce code', () => {
            console.log(source);
            console.log(output.fileContent);
        });
    });
});
