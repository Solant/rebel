import { exec } from 'child_process';

function execPromise(command: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (err, stdout: string) => {
            if (err) { reject(err); }
            resolve(stdout);
        });
    });
}

interface TestCase {
    cwd: string,
    bimo: TestCaseSetup<Function>,
    native: TestCaseSetup<string | undefined>,
}

interface TestCaseSetup<T> {
    prepare: T,
    read: string,
    write: string,
}

function runOrExec(arg: string | Function | undefined, cwd: string) {
    if (typeof arg === 'string') {
        return execPromise(arg, cwd);
    } else if (typeof arg === 'function') {
        return Promise.resolve(arg());
    } else {
        return Promise.resolve();
    }
}

export async function run(test: TestCase) {
    await Promise.all([
        runOrExec(test.bimo.prepare, test.cwd),
        runOrExec(test.native.prepare, test.cwd),
    ]);

    // prepare
    await execPromise(test.native.write, test.cwd);

    // check reads
    expect(await execPromise(test.bimo.read, test.cwd)).toEqual(await execPromise(test.native.read, test.cwd));

    await execPromise(test.bimo.write, test.cwd);

    // check writes
    expect(await execPromise(test.bimo.read, test.cwd)).toEqual(await execPromise(test.native.read, test.cwd));
}