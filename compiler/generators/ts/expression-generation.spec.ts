import { fieldDeclaration } from "./index";
import { BaseType, TypeTag } from '../../types';

describe('Field generator', () => {
    it('should generate field declaration', () => {
        const type: BaseType = {
            tag: TypeTag.BuiltIn,
            name: 'i8',
        };
        expect(fieldDeclaration({ name: 'test1', args: [], type })).toBe('test1: number');
    });
});