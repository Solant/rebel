import { transform } from './target-transformer';
import { TypeTag } from './ir-ast';

describe('asd', () => {
    it('aaa', () => {
        console.log(JSON.stringify(transform([{
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
        }]), undefined, 2));
    });
});