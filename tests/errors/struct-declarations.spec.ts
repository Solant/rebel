import { compile, CompileError } from '../../compiler';

describe('Struct declarations', () => {
    it('should be exactly one default struct', () => {
        expect(() => compile(`
        default struct Test {
            num: i32;
        }
        
        default struct Test {
            num: i32;
        }
        `, { emitRuntime: true, target: 'ts' })).toThrow(CompileError);

        expect(() => compile(`
        struct Test {
            num: i32;
        }
        `, { emitRuntime: true, target: 'ts' })).toThrow(CompileError);
    });
});
