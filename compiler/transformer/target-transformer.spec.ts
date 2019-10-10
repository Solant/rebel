import { transform } from './target-transformer';
import { TypeTag } from './ir-ast';

describe('Target transformer', () => {
    it('should not fail', () => {
        expect(() => transform([{
            tag: TypeTag.Custom,
            name: 'TestType',
            default: true,
            props: [{
                name: 'property1',
                access: 'public',
                type: {
                    tag: TypeTag.BuiltIn,
                    name: 'i32',
                    typeArgs: {},
                },
            }],
        }])).not.toThrow();
    });
});