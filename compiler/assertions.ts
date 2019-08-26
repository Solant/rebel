export function assertNever(a: never): void {
    console.error(a);
    console.trace();
    throw new TypeError(`Switch value ${a} is not supported`);
}

export class CompileError extends Error {
    position?: { line: number, column: number };
    constructor(m: string, pos?: { line: number, column: number }) {
        if (pos) {
            super(`Compilation error at input:${pos.line}:${pos.column}\n${m}`)
        } else {
            super(m);
        }
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, CompileError.prototype);
        this.name = 'CompileError';
        this.position = pos;
    }
}

export class CodeGenerationError extends Error {
    constructor(m: string) {
        super(`Compilation error:\n${m}`);
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, CodeGenerationError.prototype);
        this.name = 'CodeGenerationError';
    }
}