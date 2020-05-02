import { RebelStream } from '../src/runtime';

describe('Runtime', () => {
    it('should create read and write streams', () => {
        expect(() => { new RebelStream() }).not.toThrow();
        expect(() => { new RebelStream(25) }).not.toThrow();
        expect(() => { new RebelStream(Buffer.alloc(256, 0)) }).not.toThrow();
        expect(() => { new RebelStream(new ArrayBuffer(256)) }).not.toThrow();
    });

    it('should resize properly', () => {
        const stream = new RebelStream(8);
        stream.writeI32(25);
        stream.writeI32(26);
        stream.writeI32(27);
    });

    it('should trim result buffer', () => {
        const stream = new RebelStream(15);
        stream.writeI32(25);
        stream.writeI32(26);
        stream.writeI32(27);
        expect(stream.result().byteLength).toBe(12);
    });
});
