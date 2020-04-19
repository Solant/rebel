import { transform, parse, CompileError } from '../../';

describe('Array fields ', () => {
    it('should have type argument', () => {
        expect(() => transform(parse(`
        default struct Test {
            size: i32;
            data: array<3>;
        }
        `))).toThrow(CompileError);
    });

    it('should have size argument', () => {
        expect(() => transform(parse(`
        default struct Test {
            size: i32;
            data: array<i32<le>>;
        }
        `))).toThrow(CompileError);
    });

    it('should refer to existing field', () => {
        expect(() => transform(parse(`
        default struct Test {
            size: i32;
            data: array<i32<le>>();
        }
        `))).toThrow(CompileError);
    });

    it('should not have endianness param', () => {
        expect(() => transform(parse(`
        default struct Test {
            size: i32;
            data: array<i32<le>, le>(size);
        }
        `))).toThrow(CompileError);
    });
});
