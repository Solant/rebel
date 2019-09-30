import { generate, parse, transform as transformIR } from '../../index';
import { transform as transformTarget } from '../transformer/target-transformer';
import { ts } from './generator-module';

describe('a1', function () {
    it('should work', () => {
        const ast = parse(`
        struct Test2 {
            foo: i32;
        }
        
        default struct Test {
            size: i32;
            baz: Test2;
        }
        `);
        const irAst = transformIR(ast);
        const targetAst = transformTarget(irAst);
        console.log(ts.generate(targetAst));
    });
});