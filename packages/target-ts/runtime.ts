import { render } from 'mustache';

export function injectedCode() {
    return render(
`
class BimoStream {
    offset: number;
    buffer: Buffer;

    constructor(buffer: Buffer) {
        this.offset = 0;
        this.buffer = buffer;
    }
    
    {{#signedNumbers}}
    read{{name}}(le = true): number {
        let value: number = 0;
        if (le) {
            value = this.buffer.readIntLE(this.offset, {{size}});
        } else {
            value = this.buffer.readIntBE(this.offset, {{size}});
        }
        this.offset += {{size}};
        return value;
    }
    
    write{{name}}(value: number, le = true) {
        if (le) {
            this.buffer.writeIntLE(value, this.offset, {{size}});
        } else {
            this.buffer.writeIntBE(value, this.offset, {{size}});
        }
        this.offset += {{size}};
    }
    {{/signedNumbers}}
    
    {{#unsignedNumbers}}
    read{{name}}(le = true): number {
        let value: number = 0;
        if (le) {
            value = this.buffer.readUIntLE(this.offset, {{size}});
        } else {
            value = this.buffer.readUIntBE(this.offset, {{size}});
        }
        this.offset += {{size}};
        return value;
    }
    
    write{{name}}(value: number, le = true) {
        if (le) {
            this.buffer.writeUIntLE(value, this.offset, {{size}});
        } else {
            this.buffer.writeUIntBE(value, this.offset, {{size}});
        }
        this.offset += {{size}};
    }
    {{/unsignedNumbers}}
}
`,
        {
            signedNumbers: [
                { name: 'I8', size: 1 },
                { name: 'I16', size: 2 },
                { name: 'I32', size: 4 },
                { name: 'I64', size: 8 },
            ],
            unsignedNumbers: [
                { name: 'U8', size: 1 },
                { name: 'U16', size: 2 },
                { name: 'U32', size: 4 },
                { name: 'U64', size: 8 },
            ],
        }
    )
}
