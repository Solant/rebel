class BimoStream {
    constructor(buffer) {
        this.offset = 0;
        this.buffer = buffer;
    }

    readInt32LE() {
        const value = this.buffer.readInt32LE(this.offset);
        this.offset += 4;

        return value;
    }
}