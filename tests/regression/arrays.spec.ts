import { compile } from '../../compiler';

describe('Array cases', function () {
    it('should allow unparametrized child types', () => {
        expect(() => compile(`
        default struct Test {
            size: i32;
            data: array<i32, #size>;
        }
        `, { emitRuntime: true, target: 'ts' })).not.toThrow();
    })
});