export function getCliArg(argv: string[], name: string): string | undefined {
    return argv.filter(a => a.startsWith(`--${name}=`))
        .map(a => a.split('=')[1])[0];
}
