class BimoStream {
    offset: number;
    buffer: Buffer;

    constructor(buffer: Buffer) {
        this.offset = 0;
        this.buffer = buffer;
    }

    readI32(le = true) {
        this.offset += 4;
        if (le) {
            return this.buffer.readInt32LE(this.offset - 4);
        }
        return this.buffer.readInt32BE(this.offset - 4);
    }

    writeI32(value: number, le = true) {
        this.offset += 4;
        if (le) {
            return this.buffer.writeInt32LE(value, this.offset - 4);
        }
        return this.buffer.writeInt32BE(value, this.offset - 4);
    }
}