export function assertNever(a: never): void {
    console.error(a);
    console.trace();
    throw new TypeError(`Switch value ${a} is not supported`);
}
