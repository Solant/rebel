import { transform, parse, CompileError } from '../../';

describe('Struct declarations', () => {
    it('should be exactly one default struct', () => {
        expect(() => transform(parse(`
        default struct Test {
            num: i32;
        }
        
        default struct Test {
            num: i32;
        }
        `))).toThrow(CompileError);

        expect(() => transform(parse(`
        struct Test {
            num: i32;
        }
        `))).toThrow(CompileError);
    });
});
