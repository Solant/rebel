export default `

class RebelStream {
    pos: number = 0;
    arrayBuffer: ArrayBuffer;
    dataView: DataView;

    private static isNodeBuffer(b: any): b is Buffer {
        return b.buffer !== undefined;
    }

    constructor(buffer: ArrayBuffer | Buffer) {
        if (RebelStream.isNodeBuffer(buffer)) {
            this.arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
        } else {
            this.arrayBuffer = buffer;
        }

        this.dataView = new DataView(this.arrayBuffer);
    }

    readString(length: number, encoding: string = 'ascii'): string {
        let result = '';
        if (encoding === 'ascii') {
            const buf = new Uint8Array(this.arrayBuffer.slice(this.pos + length));
            for (let i = 0; i < buf.length; i++) {
                result += String.fromCharCode(buf[i]);
            }
        }

        return result;
    }

    writeString(value: string, encoding: string = 'ascii'): void {
        this.write(value.length, () => {
            for (let i = 0; i < value.length; i++) {
                this.dataView.setUint8(this.pos + i, value.charCodeAt(i));
            }
        });
    }

    readU8(): number {
        const result = this.dataView.getUint8(this.pos);
        this.pos += 1;
        return result;
    }

    readU16(endianness: string = 'le'): number {
        const result = this.dataView.getUint16(this.pos, endianness === 'le');
        this.pos += 2;
        return result;
    }

    readU32(endianness: string = 'le'): number {
        const result = this.dataView.getUint32(this.pos, endianness === 'le');
        this.pos += 4;
        return result;
    }

    writeU8(value: number): void {
        this.write(1, () => this.dataView.setUint8(this.pos, value));
    }

    writeU16(value: number, endianness: string = 'le'): void {
        this.write(2, () => this.dataView.setUint16(this.pos, value));
    }

    writeU32(value: number, endianness: string = 'le'): void {
        this.write(4, () => this.dataView.setUint32(this.pos, value));
    }

    readI8(): number {
        const result = this.dataView.getInt8(this.pos);
        this.pos += 1;
        return result;
    }

    readI16(endianness: string = 'le'): number {
        const result = this.dataView.getInt16(this.pos, endianness === 'le');
        this.pos += 2;
        return result;
    }

    readI32(endianness: string = 'le'): number {
        const result = this.dataView.getInt32(this.pos, endianness === 'le');
        this.pos += 4;
        return result;
    }

    writeI8(value: number): void {
        this.write(1, () => this.dataView.setInt8(this.pos, value));
    }

    writeI16(value: number, endianness: string = 'le'): void {
        this.write(2, () => this.dataView.setInt16(this.pos, value, endianness === 'le'));
    }

    writeI32(value: number, endianness: string = 'le'): void {
        this.write(4, () => this.dataView.setInt32(this.pos, value, endianness === 'le'));
    }

    private write(bytes: number, cb: () => void): void {
        if (this.pos + bytes > this.arrayBuffer.byteLength) {
            throw new Error('Resize is not implemented');
        }

        cb();

        this.pos += bytes;
    }
}
`;
