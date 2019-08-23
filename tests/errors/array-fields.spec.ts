import { compile, CompileError } from '../../compiler';

describe('Array fields ', () => {
    it('should have type argument', () => {
        expect(() => compile(`
        default struct Test {
            size: i32;
            data: array<3>;
        }
        `)).toThrow(CompileError);
    });

    it('should have size argument', () => {
        expect(() => compile(`
        default struct Test {
            size: i32;
            data: array<i32<le>>;
        }
        `)).toThrow(CompileError);
    });
});
