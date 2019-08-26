export interface CodeGeneratorOptions {
    emitRuntime?: boolean;
}

export function defaultOptions(): CodeGeneratorOptions {
    return {
        emitRuntime: true,
    }
}